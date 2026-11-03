import React, { useEffect } from 'react';
import gsap from 'gsap';
import PageTransition from '../components/PageTransition';

const TermsOfUsePage: React.FC = () => {
  useEffect(() => {
    gsap.fromTo(
      '.terms-content > *',
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
              Terms of Use
            </h1>
            <div className="w-20 h-[1px] bg-red-600"></div>
          </div>

          <div className="terms-content text-white/60 space-y-8 leading-relaxed">
            <section>
              <h2 className="text-xl text-white font-heading uppercase tracking-wider mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. 
                If you do not agree to abide by these terms, please do not use this website.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white font-heading uppercase tracking-wider mb-4">2. Intellectual Property</h2>
              <p>
                All content on this website, including but not limited to videos, images, logos, text, and design, is the property 
                of Kajal Arefin Ome, Boom Films, or their respective copyright holders. Unauthorized use, reproduction, or distribution 
                of this material is strictly prohibited.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl text-white font-heading uppercase tracking-wider mb-4">3. User Conduct</h2>
              <p>
                Users agree to use this website only for lawful purposes. You must not use the contact forms or any communication 
                features to transmit spam, malicious software, or offensive content.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-white font-heading uppercase tracking-wider mb-4">4. Limitation of Liability</h2>
              <p>
                The information on this website is provided "as is". We make no warranties regarding the accuracy or completeness 
                of the content and shall not be liable for any damages arising from the use of this site.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-white font-heading uppercase tracking-wider mb-4">5. Modifications</h2>
              <p>
                We reserve the right to modify these Terms of Use at any time. Your continued use of the website following any changes 
                indicates your acceptance of the new terms.
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

export default TermsOfUsePage;
