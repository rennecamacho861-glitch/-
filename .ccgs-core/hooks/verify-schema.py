import sys
import json
import os

def verify(file_path, schema_path):
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        sys.exit(1)
        
    with open(schema_path, 'r') as f:
        schema = json.load(f)
        
    with open(file_path, 'r') as f:
        content = f.read()
        
    # Check Frontmatter
    if content.startswith('---'):
        parts = content.split('---', 2)
        if len(parts) >= 3:
            frontmatter_raw = parts[1]
        else:
            print("Error: Malformed YAML frontmatter.")
            sys.exit(1)
    else:
        print("Error: Missing YAML frontmatter (---).")
        sys.exit(1)
        
    frontmatter_keys = []
    for line in frontmatter_raw.split('\n'):
        line = line.strip()
        if line and ':' in line:
            key = line.split(':')[0].strip()
            frontmatter_keys.append(key)
            
    for req in schema.get('required_frontmatter', []):
        if req not in frontmatter_keys:
            print(f"Error: Missing required frontmatter field: '{req}'")
            sys.exit(1)
            
    # Check Sections
    sections = []
    for line in content.split('\n'):
        if line.startswith('## '):
            sections.append(line.replace('## ', '').strip())
            
    for req in schema.get('required_sections', []):
        if req not in sections:
            print(f"Error: Missing required section: '## {req}'")
            sys.exit(1)
            
    # Check Dependency Fields
    for req in schema.get('required_dependency_fields', []):
        if req not in content:
            print(f"Error: Missing required field '{req}' in the document.")
            sys.exit(1)

    print(f"Success: {file_path} passed schema validation.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python verify-schema.py <markdown_file> <schema_type (story|epic)>")
        sys.exit(1)
        
    md_file = sys.argv[1]
    schema_type = sys.argv[2]
    
    schema_dir = os.path.join(os.path.dirname(__file__), '../rules/schemas')
    schema_file = os.path.join(schema_dir, f"{schema_type}.json")
    
    verify(md_file, schema_file)
