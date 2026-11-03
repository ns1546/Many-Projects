from jinja2 import Template

class GenerationService:
    @staticmethod
    def render_html(template_str: str, data: dict) -> str:
        # Wrap the template in standard EvoRise Solutions branding if missing
        if "<html>" not in template_str.lower():
            template_str = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: 'Inter', sans-serif; margin: 40px; color: #1a202c; }}
                    .header {{ border-bottom: 2px solid #2b6cb0; padding-bottom: 10px; margin-bottom: 20px; }}
                    .logo {{ font-size: 24px; font-weight: bold; color: #2b6cb0; }}
                    .footer {{ margin-top: 40px; font-size: 12px; color: #718096; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">EvoRise Solutions</div>
                    <div>Corporate Report</div>
                </div>
                <div class="content">
                    {template_str}
                </div>
                <div class="footer">
                    &copy; EvoRise Solutions - Confidential and Proprietary
                </div>
            </body>
            </html>
            """
        
        jinja_template = Template(template_str)
        return jinja_template.render(**data)
