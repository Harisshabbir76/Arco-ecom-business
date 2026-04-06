import os

def remove_bom(file_path):
    with open(file_path, 'rb') as f:
        content = f.read()
    if content.startswith(b'\xef\xbb\xbf'):
        print(f"Removing BOM from {file_path}")
        with open(file_path, 'wb') as f:
            f.write(content[3:])
        return True
    return False

src_dir = r'e:\Haris\projects\MERN-e-commerce--main\frontend\src'
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.js') or file.endswith('.css'):
            remove_bom(os.path.join(root, file))
print("BOM removal check complete.")
