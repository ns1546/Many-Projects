import sys

def main():
    file_path = "g:/Download Official/New folder (6)/EvoRise Document Generator - EvoRise Solutions.html"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the start of the first corrupted block
    start_str_1 = "                    setTimeout(() => {\n                        btn.classList.remove('loading');\n                        btn.innerHTML = '↻ Load / Refresh Content';"
    start_idx_1 = content.find(start_str_1)
    if start_idx_1 == -1:
        print("Could not find start 1")
        return

    # Find the end of the first corrupted block
    end_str_1 = "        function autoConvertProposalToAgreement(silent = false) {"
    end_idx_1 = content.find(end_str_1)
    if end_idx_1 == -1:
        print("Could not find end 1")
        return

    # Find the start of the second corrupted block
    start_str_2 = "            if (!silent) {\n                alert(`Agreement automatically populated with services and pricing from the Proposal's ${pkg} package!`);\n            }\n        }"
    start_idx_2 = content.find(start_str_2)
    if start_idx_2 == -1:
        print("Could not find start 2")
        return
    start_idx_2 += len(start_str_2) + 1

    # Find the end of the second corrupted block
    end_str_2 = "        let undoAiHtmlStack = {};"
    end_idx_2 = content.find(end_str_2)
    if end_idx_2 == -1:
        print("Could not find end 2")
        return

    print("Found all indices:")
    print("start 1:", start_idx_1)
    print("end 1:", end_idx_1)
    print("start 2:", start_idx_2)
    print("end 2:", end_idx_2)

    # I will construct the repaired file by combining the safe parts and reading the fixed blocks from external files.
    with open("block1.txt", "r", encoding="utf-8") as f:
        block1 = f.read()
    with open("block2.txt", "r", encoding="utf-8") as f:
        block2 = f.read()

    new_content = content[:start_idx_1] + block1 + "\n\n" + content[end_idx_1:start_idx_2] + "\n\n" + block2 + "\n\n" + content[end_idx_2:]

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("File repaired.")

if __name__ == '__main__':
    main()
