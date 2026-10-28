"""
OS Guardian — Complete Working Model Explanation Generator
Generates:
1. docs/OS_Guardian_Complete_Working_Model_Explanation.md
2. docs/OS_Guardian_Complete_Working_Model_Explanation.docx
3. docs/OS_Guardian_Complete_Working_Model_Explanation.pdf
"""

import os
import sys
from pathlib import Path

# Paths
BASE_DIR = Path(r"c:\Users\Steven\OneDrive\Desktop\os guardian")
DOCS_DIR = BASE_DIR / "docs"
SCREENSHOTS_DIR = DOCS_DIR / "screenshots"

MD_PATH = DOCS_DIR / "OS_Guardian_Complete_Working_Model_Explanation.md"
DOCX_PATH = DOCS_DIR / "OS_Guardian_Complete_Working_Model_Explanation.docx"
PDF_PATH = DOCS_DIR / "OS_Guardian_Complete_Working_Model_Explanation.pdf"

print(f"Generating documents in {DOCS_DIR}...")
