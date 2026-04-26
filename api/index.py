import sys, os
# Add repo root to path so 'backend.main' is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.main import app
