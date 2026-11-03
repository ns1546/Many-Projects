from PIL import Image
Image.open('images/indian_tourist.png').convert('RGB').save('images/indian_tourist.jpg', 'JPEG')
Image.open('images/malaysia.png').convert('RGB').save('images/malaysia.jpg', 'JPEG')
