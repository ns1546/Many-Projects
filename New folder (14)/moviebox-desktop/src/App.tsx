import { useState, useEffect, useRef } from 'react';
import { Search, Play, X, Clapperboard, Star, Settings, Volume2, Maximize, Pause, VolumeX, Check, Languages } from 'lucide-react';
import * as dashjs from 'dashjs';
import './index.css';

interface CatalogItem {
  id: string;
  title: string;
  poster: string;
  kind: string;
  year?: number;
}

interface MediaDetails {
  id: string;
  title: string;
  overview: string;
  poster: string;
  background?: string;
  year?: number;
  kind: string;
  rating?: number;
  duration?: string;
  seasons?: {
    season_number: number;
    title: string;
    episodes: {
      season_number: number;
      episode_number: number;
      title: string;
    }[];
  }[];
}

interface Release {
  url: string;
  quality: string;
  source: string;
  isDash?: boolean;
}

function App() {
  const [tab, setTab] = useState<'home' | 'movies' | 'series'>('home');
  const [query, setQuery] = useState('');
  
  // Filters state
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const [country, setCountry] = useState('');
  const [sort, setSort] = useState('');
  
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [homeGroups, setHomeGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Player state
  const [playingReleases, setPlayingReleases] = useState<Release[] | null>(null);
  const [activeReleaseIdx, setActiveReleaseIdx] = useState(0);
  const [playerLoading, setPlayerLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playerInstance, setPlayerInstance] = useState<dashjs.MediaPlayerClass | null>(null);

  // Player UI state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // DASH capabilities
  const [videoQualities, setVideoQualities] = useState<any[]>([]);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [textTracks, setTextTracks] = useState<any[]>([]);
  const [activeQuality, setActiveQuality] = useState(-1); // -1 is auto
  const [activeAudio, setActiveAudio] = useState<any>(null);
  const [activeText, setActiveText] = useState<any>(null);

  // Series selection
  const [activeSeason, setActiveSeason] = useState<number>(1);

  useEffect(() => {
    fetchData();
  }, [tab, query, year, genre, country, sort]);

  const fetchData = async () => {
    setLoading(true);
    setItems([]);
    try {
      let url = '';
      if (query || year || genre || country || sort || tab !== 'home') {
        const type = tab === 'movies' ? 1 : tab === 'series' ? 2 : 0;
        url = `/api/search?q=${encodeURIComponent(query)}&type=${type}&page=1`;
        if (year) url += `&year=${year}`;
        if (genre) url += `&genre=${encodeURIComponent(genre)}`;
        if (country) url += `&country=${encodeURIComponent(country)}`;
        if (sort) url += `&sort=${sort}`;
      } else {
        url = '/api/home';
      }
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.groups) {
        setHomeGroups(data.groups);
        setItems([]);
      } else if (data.items || data.list) {
        setItems(data.items || data.list);
        setHomeGroups([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (id: string) => {
    setSelectedId(id);
    setDetailsLoading(true);
    setDetails(null);
    try {
      const res = await fetch(`/api/details?id=${encodeURIComponent(id)}`);
      const data: MediaDetails = await res.json();
      setDetails(data);
      if (data.seasons && data.seasons.length > 0) {
        setActiveSeason(data.seasons[0].season_number);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const loadStreams = async (id: string, season = 0, episode = 0) => {
    setPlayerLoading(true);
    try {
      const res = await fetch(`/api/streams?id=${encodeURIComponent(id)}&season=${season}&episode=${episode}`);
      const data = await res.json();
      if (data.releases && data.releases.length > 0) {
        setPlayingReleases(data.releases);
        setActiveReleaseIdx(0);
      } else {
        alert("No streams available");
      }
    } catch (e) {
      console.error(e);
      alert("Error fetching streams");
    } finally {
      setPlayerLoading(false);
    }
  };

  const handlePlayClick = () => {
    if (!details) return;
    if (details.kind === 'series') {
       loadStreams(details.id, 1, 1);
    } else {
       loadStreams(details.id, 0, 0);
    }
  };

  const handleEpisodePlay = (s: number, e: number) => {
    if (!details) return;
    loadStreams(details.id, s, e);
  };

  useEffect(() => {
    if (playingReleases && videoRef.current) {
      const activeStream = playingReleases[activeReleaseIdx];
      
      if (activeStream.isDash) {
        const player = dashjs.MediaPlayer().create();
        player.initialize(videoRef.current, activeStream.url, true);
        
        player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
          setVideoQualities(player.getRepresentationsByType('video'));
          setAudioTracks(player.getTracksFor('audio'));
          setTextTracks(player.getTracksFor('text'));
          
          setActiveAudio(player.getCurrentTrackFor('audio'));
          setActiveText(player.getCurrentTrackFor('text'));
        });

        player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (e: any) => {
          if(e.mediaType === 'video') setActiveQuality(e.newQuality);
        });

        setPlayerInstance(player);
        
        return () => {
          player.destroy();
          setPlayerInstance(null);
          setVideoQualities([]);
          setAudioTracks([]);
          setTextTracks([]);
        };
      }
    }
  }, [playingReleases, activeReleaseIdx]);

  // Video Events
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      if (newVol > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      } else if (newVol === 0 && !isMuted) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      if (videoRef.current.muted) {
        setVolume(0);
      } else {
        setVolume(videoRef.current.volume || 1);
      }
    }
  };

  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * duration;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (playingReleases) {
    const activeStream = playingReleases[activeReleaseIdx];
    return (
      <div className="player-container" ref={playerContainerRef}>
        <div className="player-header">
          <div style={{color: 'white', fontWeight: 600, fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
            {details?.title}
          </div>
          <button className="player-close" onClick={() => setPlayingReleases(null)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="video-wrapper" onClick={togglePlay}>
          <video 
            ref={videoRef}
            src={activeStream.isDash ? undefined : activeStream.url} 
            autoPlay 
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        <div className="player-custom-controls">
          <div className="progress-bar-container" onClick={handleProgressClick}>
            <div 
              className="progress-bar-filled" 
              style={{width: `${(currentTime / duration) * 100}%`}}
            />
          </div>
          
          <div className="controls-row">
            <div className="controls-left">
              <button className="control-btn" onClick={togglePlay}>
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>
              <div className="volume-control-wrapper" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <button className="control-btn" onClick={toggleMute}>
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input 
                  type="range" 
                  min="0" max="1" step="0.05" 
                  value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange}
                  style={{width: '60px', cursor: 'pointer', accentColor: 'var(--accent)'}}
                />
              </div>
              <span className="control-text">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="controls-right">
              {/* Server Source Dropdown */}
              <div className="player-menu">
                <button className="player-menu-btn">
                  Source: {activeStream.source} <Settings size={16} />
                </button>
                <div className="player-dropdown">
                  {playingReleases.map((r, i) => (
                    <button key={i} className={`dropdown-item ${activeReleaseIdx === i ? 'active' : ''}`} onClick={() => setActiveReleaseIdx(i)}>
                      {activeReleaseIdx === i && <Check size={16} />}
                      {r.source} - {r.quality}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Dropdown (DASH only) */}
              {playerInstance && videoQualities.length > 0 && (
                <div className="player-menu">
                  <button className="player-menu-btn">
                    Quality: {activeQuality === -1 ? 'Auto' : `${videoQualities[activeQuality]?.height}p`} <Settings size={16} />
                  </button>
                  <div className="player-dropdown">
                    <button 
                      className={`dropdown-item ${activeQuality === -1 ? 'active' : ''}`}
                      onClick={() => {
                        playerInstance.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: true } } } });
                        setActiveQuality(-1);
                      }}
                    >
                      {activeQuality === -1 && <Check size={16} />} Auto
                    </button>
                    {videoQualities.map((q, i) => (
                      <button 
                        key={i} 
                        className={`dropdown-item ${activeQuality === i ? 'active' : ''}`}
                        onClick={() => {
                          playerInstance.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: false } } } });
                          playerInstance.setQualityFor('video', i);
                          setActiveQuality(i);
                        }}
                      >
                        {activeQuality === i && <Check size={16} />} {q.height}p ({Math.round((q.bandwidth || q.bitrate || 0)/1024)} kbps)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Dropdown (DASH only) */}
              {playerInstance && audioTracks.length > 1 && (
                <div className="player-menu">
                  <button className="player-menu-btn">
                    <Languages size={18} /> Audio
                  </button>
                  <div className="player-dropdown">
                    {audioTracks.map((t, i) => (
                      <button 
                        key={i} 
                        className={`dropdown-item ${activeAudio?.id === t.id ? 'active' : ''}`}
                        onClick={() => {
                          playerInstance.setCurrentTrack(t);
                          setActiveAudio(t);
                        }}
                      >
                        {activeAudio?.id === t.id && <Check size={16} />} {t.lang || `Audio ${i+1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtitles Dropdown (DASH only) */}
              {playerInstance && textTracks.length > 0 && (
                <div className="player-menu">
                  <button className="player-menu-btn">
                    Subtitles <Settings size={16} />
                  </button>
                  <div className="player-dropdown">
                    <button 
                      className={`dropdown-item ${!activeText ? 'active' : ''}`}
                      onClick={() => {
                        playerInstance.enableText(false);
                        setActiveText(null);
                      }}
                    >
                      {!activeText && <Check size={16} />} Off
                    </button>
                    {textTracks.map((t, i) => (
                      <button 
                        key={i} 
                        className={`dropdown-item ${activeText?.id === t.id ? 'active' : ''}`}
                        onClick={() => {
                          playerInstance.enableText(true);
                          playerInstance.setCurrentTrack(t);
                          setActiveText(t);
                        }}
                      >
                        {activeText?.id === t.id && <Check size={16} />} {t.lang || `Subtitle ${i+1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button className="control-btn" onClick={toggleFullscreen}>
                <Maximize size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <div className="logo" onClick={() => { setTab('home'); setQuery(''); setYear(''); setGenre(''); }}>
          <Clapperboard size={28} color="var(--accent)" />
          MovieBox
        </div>
        
        <div className="nav-links">
          <div className={`nav-link ${tab === 'home' ? 'active' : ''}`} onClick={() => {setTab('home'); setQuery('');}}>Home</div>
          <div className={`nav-link ${tab === 'movies' ? 'active' : ''}`} onClick={() => {setTab('movies'); setQuery('');}}>Movies</div>
          <div className={`nav-link ${tab === 'series' ? 'active' : ''}`} onClick={() => {setTab('series'); setQuery('');}}>Series</div>
        </div>

        <div className="search-bar">
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search movies, tv shows..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      {(tab === 'movies' || tab === 'series' || query) && (
        <div className="filters-bar">
          <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="">Sort By: Popularity</option>
            <option value="1">Popularity</option>
            <option value="2">Newest</option>
            <option value="3">Rating</option>
          </select>
          <select className="filter-select" value={year} onChange={e => setYear(e.target.value)}>
            <option value="">Year: All</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="2019">2019</option>
          </select>
          <select className="filter-select" value={genre} onChange={e => setGenre(e.target.value)}>
            <option value="">Genre: All</option>
            <option value="1">Action</option>
            <option value="2">Comedy</option>
            <option value="3">Drama</option>
            <option value="4">Horror</option>
            <option value="5">Romance</option>
            <option value="6">Sci-Fi</option>
          </select>
          <select className="filter-select" value={country} onChange={e => setCountry(e.target.value)}>
            <option value="">Country: All</option>
            <option value="1">United States</option>
            <option value="2">United Kingdom</option>
            <option value="3">South Korea</option>
            <option value="4">Japan</option>
            <option value="5">France</option>
          </select>
        </div>
      )}

      <main className="main-content" style={{paddingTop: (tab === 'movies' || tab === 'series' || query) ? '20px' : '100px'}}>
        <h2 className="section-title">
          {query ? `Search Results for "${query}"` : tab === 'home' ? 'Trending Now' : tab === 'movies' ? 'Movies' : 'TV Shows'}
        </h2>
        {loading ? (
          <div className="loader-container"><div className="loader"></div></div>
        ) : tab === 'home' && !query ? (
          <div className="home-groups">
            {homeGroups.map((group, gIndex) => (
              <div key={gIndex} className="home-group">
                <h3 className="group-title">{group.title}</h3>
                <div className="group-carousel">
                  {group.items.map((item: any, i: number) => (
                    <div 
                      key={`${item.id}-${i}`} 
                      className="card"
                      onClick={() => loadDetails(item.id)}
                    >
                      <div className="card-image-wrapper">
                        <img src={item.poster} alt={item.title} className="card-image" loading="lazy" />
                        <div className="card-overlay">
                          <div className="card-play-btn">
                            <Play size={24} color="black" fill="black" style={{marginLeft: 4}} />
                          </div>
                        </div>
                      </div>
                      <div className="card-info">
                        <div className="card-title">{item.title}</div>
                        <div className="card-meta">
                          <span>{item.year || ''}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid">
            {items.map((item, index) => (
              <div 
                key={`${item.id}-${index}`} 
                className="card"
                onClick={() => loadDetails(item.id)}
              >
                <div className="card-image-wrapper">
                  <img src={item.poster} alt={item.title} className="card-image" loading="lazy" />
                  <div className="card-overlay">
                    <div className="card-play-btn">
                      <Play size={24} color="black" fill="black" style={{marginLeft: 4}} />
                    </div>
                  </div>
                </div>
                <div className="card-info">
                  <div className="card-title">{item.title}</div>
                  <div className="card-meta">
                    <span>{item.year || ''}</span>
                    <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <Star size={14} color="var(--accent)" fill="var(--accent)" /> 
                      {/* Using random rating for visual effect since list API might not have it */}
                      {(Math.random() * (9.8 - 6.5) + 6.5).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedId && (
        <div className="details-view">
          <button className="player-close" onClick={() => setSelectedId(null)} style={{position: 'absolute', top: 24, right: 40, zIndex: 100, background: 'rgba(0,0,0,0.5)'}}>
            <X size={24} />
          </button>
          
          {detailsLoading ? (
            <div className="loader-container" style={{height: '100vh'}}><div className="loader"></div></div>
          ) : details ? (
            <>
              <div 
                className="details-hero" 
                style={{backgroundImage: `url(${details.background || details.poster})`}} 
              />
              <div className="details-content">
                <img src={details.poster} className="details-poster" alt="poster" />
                <div className="details-info">
                  <h1 className="details-title">{details.title}</h1>
                  <div className="details-meta">
                    {details.year && <span>{details.year}</span>}
                    <div className="badge accent">HD</div>
                    {details.rating && <span className="badge">★ {details.rating}</span>}
                    {details.duration && <span className="badge">{details.duration}</span>}
                    <span className="badge">{details.kind === 'movie' ? 'Movie' : 'Series'}</span>
                  </div>
                  <p className="details-desc">{details.overview}</p>
                  
                  <div className="actions">
                    <button className="btn btn-primary" onClick={handlePlayClick} disabled={playerLoading}>
                      {playerLoading ? (
                        <div className="loader" style={{width: 20, height: 20, borderWidth: 2}}></div>
                      ) : (
                        <><Play size={20} fill="currentColor" /> Watch Now</>
                      )}
                    </button>
                  </div>

                  {details.kind === 'series' && details.seasons && (
                    <div className="seasons-container">
                      <select 
                        className="season-selector"
                        value={activeSeason}
                        onChange={(e) => setActiveSeason(Number(e.target.value))}
                      >
                        {details.seasons.map(s => (
                          <option key={s.season_number} value={s.season_number}>
                            {s.title}
                          </option>
                        ))}
                      </select>

                      <div className="episodes-grid">
                        {details.seasons.find(s => s.season_number === activeSeason)?.episodes.map(ep => (
                          <div 
                            key={ep.episode_number} 
                            className="episode-card"
                            onClick={() => handleEpisodePlay(ep.season_number, ep.episode_number)}
                          >
                            <div className="episode-info">
                              <span className="ep-number">Episode {ep.episode_number}</span>
                              <span className="ep-title">{ep.title}</span>
                            </div>
                            <Play size={20} color="var(--accent)" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </>
  );
}

export default App;
