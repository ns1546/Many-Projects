import asyncio
from app.database import engine, Base
from app.models.template import ReportTemplate
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

TEMPLATES = [
    {
        "name": "Project Status Report",
        "description": "Standard corporate project status report including milestones, risks, and RAG status.",
        "html_content": """
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Project Status Report</h1>
            
            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Project Name:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{{ project_name }}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Date:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{{ report_date }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Project Manager:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">{{ manager_name }}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Overall Status:</strong></td>
                    <td style="padding: 8px; border: 1px solid #ddd;">
                        <span style="padding: 4px 8px; border-radius: 4px; color: white; background-color: {{ 'green' if status == 'On Track' else 'orange' if status == 'At Risk' else 'red' }};">{{ status }}</span>
                    </td>
                </tr>
            </table>

            <h2 style="color: #2c3e50; margin-top: 30px;">Executive Summary</h2>
            <p style="line-height: 1.6;">{{ executive_summary }}</p>

            <h2 style="color: #2c3e50; margin-top: 30px;">Key Milestones</h2>
            <p style="line-height: 1.6;">{{ milestones }}</p>

            <h2 style="color: #2c3e50; margin-top: 30px;">Risks & Issues</h2>
            <p style="line-height: 1.6;">{{ risks }}</p>
        </div>
        """
    },
    {
        "name": "Employee Performance Review",
        "description": "Comprehensive annual performance review template used by HR departments.",
        "html_content": """
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #444; max-width: 800px; margin: 0 auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #2b6cb0; margin-bottom: 5px;">Performance Review</h1>
                <p style="color: #718096; font-size: 14px; margin-top: 0;">Confidential HR Document</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px; background-color: #f7fafc; padding: 20px; border-radius: 8px;">
                <div>
                    <p><strong>Employee:</strong> {{ employee_name }}</p>
                    <p><strong>Title:</strong> {{ job_title }}</p>
                    <p><strong>Department:</strong> {{ department }}</p>
                </div>
                <div>
                    <p><strong>Reviewer:</strong> {{ reviewer_name }}</p>
                    <p><strong>Review Date:</strong> {{ review_date }}</p>
                    <p><strong>Overall Rating:</strong> <span style="font-size: 18px; font-weight: bold; color: #2b6cb0;">{{ overall_rating }} / 5</span></p>
                </div>
            </div>

            <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #2d3748;">Achievements & Strengths</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">{{ achievements }}</p>

            <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #2d3748; margin-top: 30px;">Areas for Improvement</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">{{ improvements }}</p>

            <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #2d3748; margin-top: 30px;">Goals for Next Period</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">{{ future_goals }}</p>
            
            <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                <div style="border-top: 1px solid #cbd5e0; width: 45%; padding-top: 10px; text-align: center;">Employee Signature</div>
                <div style="border-top: 1px solid #cbd5e0; width: 45%; padding-top: 10px; text-align: center;">Manager Signature</div>
            </div>
        </div>
        """
    },
    {
        "name": "Monthly Financial Summary",
        "description": "High-level financial overview for executives and stakeholders.",
        "html_content": """
        <div style="font-family: Helvetica, Arial, sans-serif; color: #333; padding: 20px;">
            <h1 style="color: #1a202c;">Monthly Financial Summary: {{ month_year }}</h1>
            <p style="color: #4a5568; margin-bottom: 30px;">Prepared by: {{ preparer_name }}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div style="background-color: #ebf4ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3182ce;">
                    <h3 style="margin-top: 0; color: #2b6cb0;">Total Revenue</h3>
                    <p style="font-size: 24px; font-weight: bold; margin-bottom: 0;">${{ total_revenue }}</p>
                </div>
                <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #e53e3e;">
                    <h3 style="margin-top: 0; color: #c53030;">Total Expenses</h3>
                    <p style="font-size: 24px; font-weight: bold; margin-bottom: 0;">${{ total_expenses }}</p>
                </div>
                <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; border-left: 4px solid #38a169;">
                    <h3 style="margin-top: 0; color: #276749;">Net Income</h3>
                    <p style="font-size: 24px; font-weight: bold; margin-bottom: 0;">${{ net_income }}</p>
                </div>
            </div>

            <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Executive Narrative</h2>
            <p style="line-height: 1.7;">{{ financial_narrative }}</p>
            
            <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 30px;">Key Variances vs Budget</h2>
            <p style="line-height: 1.7;">{{ variances }}</p>
        </div>
        """
    },
    {
        "name": "Incident Report (IT/Security)",
        "description": "Standardized form for recording system outages, security breaches, or operational incidents.",
        "html_content": """
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e53e3e; border-top: 8px solid #e53e3e; padding: 30px; background-color: #fff;">
            <h1 style="color: #c53030; margin-top: 0;">Critical Incident Report</h1>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc; width: 25%;"><strong>Incident ID:</strong></td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; width: 25%;">{{ incident_id }}</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc; width: 25%;"><strong>Severity:</strong></td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; width: 25%; color: #c53030; font-weight: bold;">{{ severity_level }}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;"><strong>Date/Time Occurred:</strong></td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0;">{{ datetime_occurred }}</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;"><strong>Reported By:</strong></td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0;">{{ reported_by }}</td>
                </tr>
            </table>

            <h3 style="color: #2d3748;">Incident Description</h3>
            <div style="background: #edf2f7; padding: 15px; border-radius: 4px; min-height: 80px;">{{ description }}</div>

            <h3 style="color: #2d3748; margin-top: 25px;">Root Cause Analysis</h3>
            <div style="background: #edf2f7; padding: 15px; border-radius: 4px; min-height: 80px;">{{ root_cause }}</div>

            <h3 style="color: #2d3748; margin-top: 25px;">Mitigation & Next Steps</h3>
            <div style="background: #edf2f7; padding: 15px; border-radius: 4px; min-height: 80px;">{{ next_steps }}</div>
        </div>
        """
    },
    {
        "name": "Official Meeting Minutes",
        "description": "Template for recording discussions, decisions, and action items in board or team meetings.",
        "html_content": """
        <div style="font-family: Georgia, serif; color: #111; max-width: 800px; margin: 0 auto; padding: 40px; background-color: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Meeting Minutes</h1>
                <h3 style="margin: 10px 0 0 0; color: #555; font-weight: normal;">{{ meeting_title }}</h3>
            </div>
            
            <p><strong>Date & Time:</strong> {{ meeting_datetime }}</p>
            <p><strong>Location/Platform:</strong> {{ location }}</p>
            <p><strong>Attendees:</strong> {{ attendees }}</p>
            <p><strong>Absentees:</strong> {{ absentees }}</p>

            <h2 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">1. Call to Order</h2>
            <p>The meeting was called to order by {{ chairperson }} at {{ start_time }}.</p>

            <h2 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">2. Agenda Items Discussed</h2>
            <div style="line-height: 1.8;">{{ discussions }}</div>

            <h2 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">3. Decisions Made</h2>
            <div style="line-height: 1.8; font-weight: bold;">{{ decisions }}</div>

            <h2 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">4. Action Items</h2>
            <div style="line-height: 1.8;">{{ action_items }}</div>
            
            <p style="margin-top: 40px; font-style: italic;">Minutes submitted by: {{ submitted_by }}</p>
        </div>
        """
    }
]

async def seed_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        # Clear existing
        await session.execute(ReportTemplate.__table__.delete())
        
        # Add new
        for t_data in TEMPLATES:
            t = ReportTemplate(**t_data)
            session.add(t)
            
        await session.commit()
        print("Database seeded with enterprise templates!")

if __name__ == "__main__":
    asyncio.run(seed_db())

            <h2 style="color: #2c3e50; margin-top: 30px;">Executive Summary</h2>
            <p style="line-height: 1.6;">{{ executive_summary }}</p>

            <h2 style="color: #2c3e50; margin-top: 30px;">Key Milestones</h2>
            <p style="line-height: 1.6;">{{ milestones }}</p>

            <h2 style="color: #2c3e50; margin-top: 30px;">Risks & Issues</h2>
            <p style="line-height: 1.6;">{{ risks }}</p>
        </div>
        """
    },
    {
        "name": "Employee Performance Review",
        "description": "Comprehensive annual performance review template used by HR departments.",
        "html_content": """
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #444; max-width: 800px; margin: 0 auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #2b6cb0; margin-bottom: 5px;">Performance Review</h1>
                <p style="color: #718096; font-size: 14px; margin-top: 0;">Confidential HR Document</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px; background-color: #f7fafc; padding: 20px; border-radius: 8px;">
                <div>
                    <p><strong>Employee:</strong> {{ employee_name }}</p>
                    <p><strong>Title:</strong> {{ job_title }}</p>
                    <p><strong>Department:</strong> {{ department }}</p>
                </div>
                <div>
                    <p><strong>Reviewer:</strong> {{ reviewer_name }}</p>
                    <p><strong>Review Date:</strong> {{ review_date }}</p>
                    <p><strong>Overall Rating:</strong> <span style="font-size: 18px; font-weight: bold; color: #2b6cb0;">{{ overall_rating }} / 5</span></p>
                </div>
            </div>

            <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #2d3748;">Achievements & Strengths</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">{{ achievements }}</p>

            <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #2d3748; margin-top: 30px;">Areas for Improvement</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">{{ improvements }}</p>

            <h3 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; color: #2d3748; margin-top: 30px;">Goals for Next Period</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">{{ future_goals }}</p>
            
            <div style="margin-top: 50px; display: flex; justify-content: space-between;">
                <div style="border-top: 1px solid #cbd5e0; width: 45%; padding-top: 10px; text-align: center;">Employee Signature</div>
                <div style="border-top: 1px solid #cbd5e0; width: 45%; padding-top: 10px; text-align: center;">Manager Signature</div>
            </div>
        </div>
        """
    },
    {
        "name": "Monthly Financial Summary",
        "description": "High-level financial overview for executives and stakeholders.",
        "html_content": """
        <div style="font-family: Helvetica, Arial, sans-serif; color: #333; padding: 20px;">
            <h1 style="color: #1a202c;">Monthly Financial Summary: {{ month_year }}</h1>
            <p style="color: #4a5568; margin-bottom: 30px;">Prepared by: {{ preparer_name }}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div style="background-color: #ebf4ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3182ce;">
                    <h3 style="margin-top: 0; color: #2b6cb0;">Total Revenue</h3>
                    <p style="font-size: 24px; font-weight: bold; margin-bottom: 0;">${{ total_revenue }}</p>
                </div>
                <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #e53e3e;">
                    <h3 style="margin-top: 0; color: #c53030;">Total Expenses</h3>
                    <p style="font-size: 24px; font-weight: bold; margin-bottom: 0;">${{ total_expenses }}</p>
                </div>
                <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; border-left: 4px solid #38a169;">
                    <h3 style="margin-top: 0; color: #276749;">Net Income</h3>
                    <p style="font-size: 24px; font-weight: bold; margin-bottom: 0;">${{ net_income }}</p>
                </div>
            </div>

            <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Executive Narrative</h2>
            <p style="line-height: 1.7;">{{ financial_narrative }}</p>
            
            <h2 style="color: #2d3748; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 30px;">Key Variances vs Budget</h2>
            <p style="line-height: 1.7;">{{ variances }}</p>
        </div>
        """
    },
    {
        "name": "Incident Report (IT/Security)",
        "description": "Standardized form for recording system outages, security breaches, or operational incidents.",
        "html_content": """
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #e53e3e; border-top: 8px solid #e53e3e; padding: 30px; background-color: #fff;">
            <h1 style="color: #c53030; margin-top: 0;">Critical Incident Report</h1>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 30px;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc; width: 25%;"><strong>Incident ID:</strong></td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; width: 25%;">{{ incident_id }}</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc; width: 25%;"><strong>Severity:</strong></td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; width: 25%; color: #c53030; font-weight: bold;">{{ severity_level }}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;"><strong>Date/Time Occurred:</strong></td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0;">{{ datetime_occurred }}</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;"><strong>Reported By:</strong></td>
                    <td style="padding: 10px; border: 1px solid #cbd5e0;">{{ reported_by }}</td>
                </tr>
            </table>

            <h3 style="color: #2d3748;">Incident Description</h3>
            <div style="background: #edf2f7; padding: 15px; border-radius: 4px; min-height: 80px;">{{ description }}</div>

            <h3 style="color: #2d3748; margin-top: 25px;">Root Cause Analysis</h3>
            <div style="background: #edf2f7; padding: 15px; border-radius: 4px; min-height: 80px;">{{ root_cause }}</div>

            <h3 style="color: #2d3748; margin-top: 25px;">Mitigation & Next Steps</h3>
            <div style="background: #edf2f7; padding: 15px; border-radius: 4px; min-height: 80px;">{{ next_steps }}</div>
        </div>
        """
    },
    {
        "name": "Official Meeting Minutes",
        "description": "Template for recording discussions, decisions, and action items in board or team meetings.",
        "html_content": """
        <div style="font-family: Georgia, serif; color: #111; max-width: 800px; margin: 0 auto; padding: 40px; background-color: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">Meeting Minutes</h1>
                <h3 style="margin: 10px 0 0 0; color: #555; font-weight: normal;">{{ meeting_title }}</h3>
            </div>
            
            <p><strong>Date & Time:</strong> {{ meeting_datetime }}</p>
            <p><strong>Location/Platform:</strong> {{ location }}</p>
            <p><strong>Attendees:</strong> {{ attendees }}</p>
            <p><strong>Absentees:</strong> {{ absentees }}</p>

            <h2 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">1. Call to Order</h2>
            <p>The meeting was called to order by {{ chairperson }} at {{ start_time }}.</p>

            <h2 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">2. Agenda Items Discussed</h2>
            <div style="line-height: 1.8;">{{ discussions }}</div>

            <h2 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">3. Decisions Made</h2>
            <div style="line-height: 1.8; font-weight: bold;">{{ decisions }}</div>

            <h2 style="margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">4. Action Items</h2>
            <div style="line-height: 1.8;">{{ action_items }}</div>
            
            <p style="margin-top: 40px; font-style: italic;">Minutes submitted by: {{ submitted_by }}</p>
        </div>
        """
    }
]

async def seed_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        # Clear existing
        await session.execute(Template.__table__.delete())
        
        # Add new
        for t_data in TEMPLATES:
            t = Template(**t_data)
            session.add(t)
            
        await session.commit()
        print("Database seeded with enterprise templates!")

if __name__ == "__main__":
    asyncio.run(seed_db())
