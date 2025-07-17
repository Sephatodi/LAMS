/** @jsxRuntime classic */
/** @jsx React.createElement */

import  React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { trackVideoEvent } from '../analytics';

export const VideoPlayer = ({ url, thumbnail, chapters = [] }) => {
  const [state, setState] = useState({
    playing: false,
    progress: 0,
    duration: 0,
    volume: 0.8,
    playbackRate: 1.0,
    showControls: true,
    activeChapter: null
  });
  
  const playerRef = useRef();
  const controlsTimeout = useRef();
  const firstPlay = useRef(true);

  const handleProgress = ({ playedSeconds, loadedSeconds }) => {
    setState(prev => ({ ...prev, progress: playedSeconds }));
    
    // Check for chapter markers
    const currentChapter = chapters.find(
      chap => 
        playedSeconds >= chap.startTime && 
        playedSeconds < (chap.endTime || Infinity)
    );
    
    if (currentChapter?.id !== state.activeChapter?.id) {
      setState(prev => ({ ...prev, activeChapter: currentChapter }));
      if (currentChapter) {
        trackVideoEvent({
          type: 'chapter_start',
          chapterId: currentChapter.id,
          timestamp: playedSeconds
        });
      }
    }
  };

  const handlePlay = () => {
    setState(prev => ({ ...prev, playing: true }));
    
    if (firstPlay.current) {
      trackVideoEvent({
        type: 'play',
        timestamp: state.progress
      });
      firstPlay.current = false;
    }
  };

  const handlePause = () => {
    setState(prev => ({ ...prev, playing: false }));
    trackVideoEvent({
      type: 'pause',
      timestamp: state.progress
    });
  };

  const handleEnded = () => {
    trackVideoEvent({
      type: 'complete',
      timestamp: state.duration
    });
  };

  const handleMouseMove = () => {
    setState(prev => ({ ...prev, showControls: true }));
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      setState(prev => ({ ...prev, showControls: false }));
    }, 3000);
  };

  const seekToChapter = (chapter) => {
    playerRef.current.seekTo(chapter.startTime, 'seconds');
    setState(prev => ({ ...prev, activeChapter: chapter }));
    trackVideoEvent({
      type: 'chapter_skip',
      chapterId: chapter.id,
      timestamp: chapter.startTime
    });
  };

  useEffect(() => {
    return () => {
      clearTimeout(controlsTimeout.current);
      trackVideoEvent({
        type: 'session_end',
        timestamp: state.progress,
        duration: state.progress
      });
    };
  }, []);

  return (
    <div 
      className="video-player-container"
      onMouseMove={handleMouseMove}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={state.playing}
        volume={state.volume}
        playbackRate={state.playbackRate}
        width="100%"
        height="100%"
        onReady={() => console.log('Player ready')}
        onStart={() => console.log('Playback started')}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onProgress={handleProgress}
        onDuration={(duration) => setState(prev => ({ ...prev, duration }))}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
              disablePictureInPicture: true
            }
          }
        }}
      />
      
      {!state.playing && !state.showControls && thumbnail && (
        <div 
          className="video-thumbnail-overlay"
          onClick={() => setState(prev => ({ ...prev, playing: true }))}
        >
          <img src={thumbnail} alt="Video thumbnail" />
          <button className="play-button">
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}
      
      <div className={`video-controls ${state.showControls ? 'visible' : ''}`}>
        <div className="progress-bar-container">
          <input
            type="range"
            min="0"
            max={state.duration}
            value={state.progress}
            onChange={(e) => {
              const newTime = parseFloat(e.target.value);
              playerRef.current.seekTo(newTime, 'seconds');
              setState(prev => ({ ...prev, progress: newTime }));
            }}
            className="progress-bar"
          />
          
          {chapters.length > 0 && (
            <div className="chapter-markers">
              {chapters.map(chapter => (
                <div
                  key={chapter.id}
                  className={`chapter-marker ${
                    state.activeChapter?.id === chapter.id ? 'active' : ''
                  }`}
                  style={{
                    left: `${(chapter.startTime / state.duration) * 100}%`
                  }}
                  onClick={() => seekToChapter(chapter)}
                >
                  <span className="chapter-tooltip">{chapter.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="control-buttons">
          <button
            onClick={() => 
              setState(prev => ({ ...prev, playing: !prev.playing }))
            }
          >
            {state.playing ? 'Pause' : 'Play'}
          </button>
          
          <div className="time-display">
            {formatTime(state.progress)} / {formatTime(state.duration)}
          </div>
          
          <select
            value={state.playbackRate}
            onChange={(e) => 
              setState(prev => ({ 
                ...prev, 
                playbackRate: parseFloat(e.target.value) 
              }))
            }
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.volume}
            onChange={(e) => 
              setState(prev => ({ 
                ...prev, 
                volume: parseFloat(e.target.value) 
              }))
            }
            className="volume-slider"
          />
          
          {state.activeChapter && (
            <div className="current-chapter">
              Current: {state.activeChapter.title}
            </div>
          )}
        </div>
      </div>
      
      {chapters.length > 0 && (
        <div className="chapter-list">
          <h4>Chapters</h4>
          <ul>
            {chapters.map(chapter => (
              <li
                key={chapter.id}
                className={state.activeChapter?.id === chapter.id ? 'active' : ''}
                onClick={() => seekToChapter(chapter)}
              >
                <span className="chapter-time">
                  {formatTime(chapter.startTime)}
                </span>
                <span className="chapter-title">{chapter.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

function formatTime(seconds) {
  const date = new Date(seconds * 1000);
  return date.toISOString().substr(11, 8);
}