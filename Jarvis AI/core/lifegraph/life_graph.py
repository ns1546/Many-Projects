"""
J.A.R.V.I.S. Cognitive LifeGraph: Large-Scale Semantic Knowledge & Action Graph
Provides an interconnected network of thousands of nodes across:
- Tools, Actions, Entities, Routines, Habits, Skills, and Context
- Sub-millisecond spreading activation and inverted token search
- Shortest-path entity resolution and intent-to-action traversal
"""

import os
import re
import json
import time
from enum import Enum
from typing import Dict, List, Set, Optional, Any, Tuple
from dataclasses import dataclass, field


class NodeType(str, Enum):
    TOOL = "TOOL"         # Concrete executable tool / function
    ACTION = "ACTION"     # High-level action verb / intent
    ENTITY = "ENTITY"     # Real-world object, place, device, service, concept
    ROUTINE = "ROUTINE"   # Composite multi-action workflow
    HABIT = "HABIT"       # Recurrent daily habit tracking node
    SKILL = "SKILL"       # Indexed package from the 460+ skill library
    CONTEXT = "CONTEXT"   # User state, location, preference, bio-rhythm


class RelationType(str, Enum):
    REQUIRES_TOOL = "REQUIRES_TOOL"     # Action -> Tool
    OPERATES_ON = "OPERATES_ON"         # Action -> Entity
    PART_OF = "PART_OF"                 # Action -> Routine / Entity -> Category
    TRIGGERS_ACTION = "TRIGGERS_ACTION" # Habit -> Action / Context -> Routine
    MAPS_TO_SKILL = "MAPS_TO_SKILL"     # Action -> Skill
    ASSOCIATED_WITH = "ASSOCIATED_WITH" # Entity -> Entity
    DEPENDS_ON = "DEPENDS_ON"           # Routine -> Routine


@dataclass
class LifeNode:
    id: str
    label: str
    node_type: NodeType
    category: str
    description: str = ""
    keywords: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    activation: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "node_type": self.node_type.value,
            "category": self.category,
            "description": self.description,
            "keywords": self.keywords,
            "metadata": self.metadata
        }


@dataclass
class LifeEdge:
    source_id: str
    target_id: str
    relation: RelationType
    weight: float = 1.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source_id": self.source_id,
            "target_id": self.target_id,
            "relation": self.relation.value,
            "weight": self.weight
        }


class LifeGraph:
    def __init__(self):
        self.nodes: Dict[str, LifeNode] = {}
        # Adjacency: source_id -> { target_id: LifeEdge }
        self._adj: Dict[str, Dict[str, LifeEdge]] = {}
        # Reverse Adjacency: target_id -> { source_id: LifeEdge }
        self._rev_adj: Dict[str, Dict[str, LifeEdge]] = {}
        # Inverted index: token -> Set[node_id]
        self._token_index: Dict[str, Set[str]] = {}
        # Type index: NodeType -> Set[node_id]
        self._type_index: Dict[NodeType, Set[str]] = {t: set() for t in NodeType}
        # Category index: category_str -> Set[node_id]
        self._cat_index: Dict[str, Set[str]] = {}

    def add_node(self, node: LifeNode):
        """Adds a node to the graph and indexes it."""
        self.nodes[node.id] = node
        if node.id not in self._adj:
            self._adj[node.id] = {}
        if node.id not in self._rev_adj:
            self._rev_adj[node.id] = {}

        self._type_index[node.node_type].add(node.id)

        cat = node.category
        if cat not in self._cat_index:
            self._cat_index[cat] = set()
        self._cat_index[cat].add(node.id)

        # Index tokens
        search_blob = f"{node.id} {node.label} {node.description} {' '.join(node.keywords)} {node.category}".lower()
        tokens = re.findall(r"[a-z0-9_\-]+", search_blob)
        for tok in set(tokens):
            if len(tok) >= 2:
                if tok not in self._token_index:
                    self._token_index[tok] = set()
                self._token_index[tok].add(node.id)

    def add_edge(self, source_id: str, target_id: str, relation: RelationType, weight: float = 1.0):
        """Creates a directed relationship between two nodes."""
        if source_id not in self.nodes or target_id not in self.nodes:
            return  # Silently skip missing nodes

        edge = LifeEdge(source_id=source_id, target_id=target_id, relation=relation, weight=weight)
        self._adj[source_id][target_id] = edge
        self._rev_adj[target_id][source_id] = edge

    def get_node(self, node_id: str) -> Optional[LifeNode]:
        return self.nodes.get(node_id)

    def total_nodes(self) -> int:
        return len(self.nodes)

    def total_edges(self) -> int:
        return sum(len(edges) for edges in self._adj.values())

    def get_neighbors(
        self,
        node_id: str,
        relation: Optional[RelationType] = None,
        direction: str = "outgoing"
    ) -> List[Tuple[LifeNode, LifeEdge]]:
        """Retrieves adjacent nodes filtered by relation and direction."""
        res = []
        if direction in ("outgoing", "both") and node_id in self._adj:
            for tgt, edge in self._adj[node_id].items():
                if relation is None or edge.relation == relation:
                    node = self.nodes.get(tgt)
                    if node:
                        res.append((node, edge))

        if direction in ("incoming", "both") and node_id in self._rev_adj:
            for src, edge in self._rev_adj[node_id].items():
                if relation is None or edge.relation == relation:
                    node = self.nodes.get(src)
                    if node:
                        res.append((node, edge))

        return res

    def search_nodes(self, query: str, top_k: int = 10, node_type: Optional[NodeType] = None) -> List[LifeNode]:
        """Sub-millisecond token-based search across the graph."""
        clean_tokens = [t.lower() for t in re.findall(r"[a-z0-9_\-]+", query.lower()) if len(t) >= 2]
        if not clean_tokens:
            return []

        scores: Dict[str, float] = {}
        for tok in clean_tokens:
            # Exact matches
            matching_ids = self._token_index.get(tok, set())
            for nid in matching_ids:
                scores[nid] = scores.get(nid, 0.0) + 2.0

            # Substring matches for longer tokens
            if len(tok) >= 4:
                for idx_tok, ids in self._token_index.items():
                    if tok in idx_tok and tok != idx_tok:
                        for nid in ids:
                            scores[nid] = scores.get(nid, 0.0) + 0.8

        # Filter by node type if requested
        if node_type:
            allowed = self._type_index.get(node_type, set())
            scores = {nid: sc for nid, sc in scores.items() if nid in allowed}

        sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)[:top_k]
        return [self.nodes[nid] for nid in sorted_ids if nid in self.nodes]

    def find_shortest_path(self, start_id: str, end_id: str) -> Optional[List[str]]:
        """Standard Breadth-First Search (BFS) to find the shortest relationship chain."""
        if start_id not in self.nodes or end_id not in self.nodes:
            return None
        if start_id == end_id:
            return [start_id]

        visited = {start_id}
        queue = [[start_id]]

        while queue:
            path = queue.pop(0)
            curr = path[-1]

            if curr in self._adj:
                for neighbor in self._adj[curr]:
                    if neighbor == end_id:
                        return path + [neighbor]
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(path + [neighbor])

        return None

    def activate_subgraph(self, query: str, depth: int = 2) -> Dict[str, Any]:
        """
        Spreading activation algorithm:
        Takes a user command or query, finds initial seed nodes, and radiates activation
        energy across edges to uncover the full context of connected tools, entities, and routines.
        """
        seeds = self.search_nodes(query, top_k=5)
        if not seeds:
            return {"active_nodes": [], "tools": [], "actions": [], "routines": []}

        activated_scores: Dict[str, float] = {}
        for s in seeds:
            activated_scores[s.id] = 1.0

        for _ in range(depth):
            step_deltas: Dict[str, float] = {}
            for nid, score in activated_scores.items():
                if score < 0.1:
                    continue
                # Spread to neighbors
                if nid in self._adj:
                    for tgt, edge in self._adj[nid].items():
                        spread = score * 0.5 * edge.weight
                        step_deltas[tgt] = step_deltas.get(tgt, 0.0) + spread
            for tgt, spread in step_deltas.items():
                activated_scores[tgt] = min(2.0, activated_scores.get(tgt, 0.0) + spread)

        # Categorize activated nodes
        top_ids = sorted(activated_scores.keys(), key=lambda x: activated_scores[x], reverse=True)[:25]
        active_nodes = [self.nodes[nid] for nid in top_ids if nid in self.nodes]

        tools = [n for n in active_nodes if n.node_type == NodeType.TOOL]
        actions = [n for n in active_nodes if n.node_type == NodeType.ACTION]
        routines = [n for n in active_nodes if n.node_type == NodeType.ROUTINE]
        habits = [n for n in active_nodes if n.node_type == NodeType.HABIT]
        entities = [n for n in active_nodes if n.node_type == NodeType.ENTITY]

        return {
            "query": query,
            "seed_count": len(seeds),
            "total_activated": len(active_nodes),
            "tools": [t.to_dict() for t in tools],
            "actions": [a.to_dict() for a in actions],
            "routines": [r.to_dict() for r in routines],
            "habits": [h.to_dict() for h in habits],
            "entities": [e.to_dict() for e in entities]
        }

    def get_stats(self) -> Dict[str, Any]:
        """Returns deep telemetry on the graph structure and node distribution."""
        type_counts = {t.value: len(ids) for t, ids in self._type_index.items()}
        cat_counts = {c: len(ids) for c, ids in self._cat_index.items()}
        return {
            "total_nodes": self.total_nodes(),
            "total_edges": self.total_edges(),
            "nodes_by_type": type_counts,
            "nodes_by_category": cat_counts
        }
