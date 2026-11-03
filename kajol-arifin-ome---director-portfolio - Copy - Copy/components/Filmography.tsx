
import React from 'react';
import SectionWrapper from './SectionWrapper';
import { PROJECTS } from '../constants';
import ApertureButton from './ApertureButton';

const Filmography: React.FC = () => {
  return (
    <SectionWrapper id="works">
      <div className="mb-20">
        <h2 className="text-4xl md:text-6xl font-heading mb-4 text-white animate-left">Director's Cut</h2>
        <div className="w-24 h-1 bg-red-600 animate-left"></div>
      </div>

      <div className="space-y-32">
        {PROJECTS.map((project, index) => (
          <div key={project.id} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}>
            {/* Visual Part */}
            <div className={`w-full md:w-1/2 relative group animate-${index % 2 === 0 ? 'left' : 'right'}`}>
              <div className="relative w-full aspect-[4/3] max-w-lg mx-auto overflow-hidden rounded-sm bg-[#111] border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-red-600/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover object-center block group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-red-600 text-white px-3 py-1 text-xs font-heading tracking-widest uppercase shadow-md">
                    {project.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Part */}
            <div className={`w-full md:w-1/2 animate-${index % 2 === 0 ? 'right' : 'left'}`}>
              <p className="text-red-600 font-heading text-xl mb-2">{project.year}</p>
              <h3 className="text-4xl md:text-5xl font-heading mb-4 text-white">{project.title}</h3>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                {project.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default Filmography;
