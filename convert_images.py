import base64
import os

def image_to_base64(image_path):
    """Convert image to base64 string"""
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            return encoded_string
    except Exception as e:
        print(f"Error converting {image_path}: {e}")
        return None

def main():
    images_dir = "shree_public/images"
    output_file = "base64_images.txt"
    
    # Get all jpg files
    image_files = [f for f in os.listdir(images_dir) if f.lower().endswith('.jpg')]
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("Base64 encoded images:\n\n")
        
        for image_file in sorted(image_files):
            image_path = os.path.join(images_dir, image_file)
            print(f"Converting {image_file}...")
            
            base64_string = image_to_base64(image_path)
            if base64_string:
                f.write(f"// {image_file}\n")
                f.write(f"const {image_file.replace('.jpg', '_base64')} = 'data:image/jpeg;base64,{base64_string}';\n\n")
                print(f"✓ {image_file} converted successfully")
            else:
                print(f"✗ Failed to convert {image_file}")
    
    print(f"\nBase64 conversion completed! Check {output_file}")

if __name__ == "__main__":
    main() 