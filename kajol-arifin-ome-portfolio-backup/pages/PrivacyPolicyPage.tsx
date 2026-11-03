import React, { useEffect } from 'react';
import gsap from 'gsap';
import PageTransition from '../components/PageTransition';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    gsap.fromTo(
      '.privacy-content > *',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  return (
    <PageTransition>
      <div className="pt-32 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-heading text-white uppercase tracking-wider mb-6">
              Privacy Policy
            </h1>
            <div className="w-20 h-[1px] bg-red-600"></div>
          </div>

          <div className="privacy-content text-white/60 space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl text-white font-heading uppercase tracking-wider mb-4">1. Introduction</h2>
              <p>
                Welcome to the official portfolio of Director Kajal Arefin Ome and Boom Films. 
                We respect your privacy and are committed to protecting any personal information you may provide while interacting with our platform.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white font-heading uppercase tracking-wider mb-4">2. Information Collection</h2>
              <p>
                When you use the "Quick Message" feature on our website, we collect the email address and the message contents you provide. 
                This information is used strictly to respond to your inquiries and is not shared with third parties.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white font-heading uppercase tracking-wider mb-4">3. Data Usage & Security</h2>
              <p>
                Any data collected is securely stored and used only for communication purposes. We implement standard security measures 
                to ensure your information is protected from unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-white font-heading uppercase tracking-wider mb-4">4. Cookies & Tracking</h2>
              <p>
                We may use basic cookies to enhance user experience and analyze website traffic. You can adjust your browser settings 
                to decline cookies if you prefer.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-white font-heading uppercase tracking-wider mb-4">5. Contact Us</h2>
              <p>
                If you have any questions or concerns regarding this Privacy Policy, please contact us through the General Inquiries 
                email listed in the footer or by using the Quick Message form.
              </p>
            </section>
            
            <p className="text-xs uppercase tracking-widest pt-8 border-t border-white/10">
              Last Updated: September 2026
            </p>
          </div>
          
        </div>
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicyPage;
