from PIL import Image

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    # Let's get the color of the top-left pixel as the background color
    bg_color = img.getpixel((0, 0))
    
    newData = []
    # threshold for color matching
    threshold = 50
    for item in datas:
        # Check if the pixel color is close to the background color
        if (abs(item[0] - bg_color[0]) < threshold and 
            abs(item[1] - bg_color[1]) < threshold and 
            abs(item[2] - bg_color[2]) < threshold):
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved processed image to {output_path}")

remove_background("Izanfly tours and travels logo.jpg.jpeg", "logo_transparent.png")
