import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft, Share2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { pressPhotos } from './PressPage';

const PressDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const photo = pressPhotos.find(p => p.id === Number(id));

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (photo) {
      gsap.fromTo('.photo-detail-img',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.2 }
      );
      
      gsap.fromTo('.photo-detail-content',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.4 }
      );
    }
  }, [photo]);

  if (!photo) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center flex-col text-center">
        <h1 className="text-4xl text-white font-heading mb-4">Press Highlight Not Found</h1>
        <button onClick={() => navigate('/press')} className="text-red-600 hover:text-white transition-colors">
          Return to Press & Media
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="bg-[#050505] min-h-screen pt-32 pb-20 px-6 md:px-12 relative">
        <div className="absolute top-0 left-0 w-1/3 h-[500px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Link to="/press" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors uppercase tracking-widest text-xs mb-12 group">
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            Back to Press & Media
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Image Container */}
            <div className="lg:w-2/3 photo-detail-img">
              <div className="relative group overflow-hidden bg-[#0a0a0a] border border-white/5 p-4 rounded-sm">
                <img 
                  src={photo.src} 
                  alt={photo.alt} 
                  className="w-full h-auto object-contain rounded-sm max-h-[80vh]"
                />
              </div>
            </div>

            {/* Content Container */}
            <div className="lg:w-1/3 flex flex-col justify-center photo-detail-content">
              <p className="text-red-600 font-heading tracking-[0.3em] uppercase text-xs mb-4">In The News</p>
              <h1 className="text-4xl md:text-5xl font-heading text-white tracking-wider mb-8">{photo.title}</h1>
              
              <div className="w-12 h-[2px] bg-white/10 mb-8" />
              
              <p className="text-white/60 leading-relaxed text-lg mb-12">
                {photo.details}
              </p>

              <div className="mt-auto pt-12 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4 text-white/40">
                  <span className="text-xs uppercase tracking-widest border border-white/10 px-3 py-1 rounded-sm bg-white/5">Featured Article</span>
                </div>
                
                <button className="text-white/40 hover:text-white transition-colors" title="Share Photo">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PressDetailsPage;
