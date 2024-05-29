import React from 'react';

interface Clip {
  name: string;
  id: string;
  width: number;
  xPosition: number;
}

interface Track {
  id: string;
  clips: Clip[];
}

interface VideoEditorTimelineProps {
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  trackIdSeq: number;
  setTrackIdSeq: React.Dispatch<React.SetStateAction<number>>;
  highlightTrackId: string | null;
  setHighlightTrackId: React.Dispatch<React.SetStateAction<string | null>>;
}

const VideoEditorTimeline: React.FC<VideoEditorTimelineProps> = ({
                                                                   tracks,
                                                                   setTracks,
                                                                   trackIdSeq,
                                                                   setTrackIdSeq,
                                                                   highlightTrackId,
                                                                   setHighlightTrackId
                                                                 }) => {
  const [highlightBetweenTracksId, setHighlightBetweenTracksId] = React.useState<string | null>(null);

  const handleClipDragStart = (event: React.DragEvent<HTMLDivElement>, clip: Clip) => {
    const data = JSON.stringify(clip);
    event.dataTransfer.setData("text", data);
  };

  const handleClipDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleClipDragEnter = (event: React.DragEvent<HTMLDivElement>, trackId: string) => {
    setHighlightTrackId(trackId);
  };

  const handleClipDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    setHighlightTrackId(null);
  };

  const handleClipDrop = (event: React.DragEvent<HTMLDivElement>, targetTrackId: string, targetClipId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setHighlightTrackId(null); // 移除高亮
    const data = event.dataTransfer.getData("text");
    const dataObj = JSON.parse(data);

    setTracks((prevTracks) =>
      prevTracks.map((track) => {
        if (track.id === targetTrackId) {
          const clipIndex = track.clips.findIndex(clip => clip.id === targetClipId);
          let newClips = [...track.clips];
          let clip = {
            name: dataObj.name,
            id: `clip-${track.clips.length + 1}`,
            width: dataObj.width,
            xPosition: dataObj.xPosition
          };
          newClips.splice(clipIndex + 1, 0, clip);
          return {
            ...track,
            clips: newClips,
          };
        }
        return track;
      })
    );
  };

  const handleTrackDrop = (event: React.DragEvent<HTMLDivElement>, trackId: string) => {
    event.preventDefault();
    event.stopPropagation();
    setHighlightTrackId(null); // 移除高亮
    const data = event.dataTransfer.getData("text");
    const dataObj = JSON.parse(data);

    setTracks((prevTracks) => {
      let sourceTrackId = "";
      let sourceClipIndex = -1;

      // 找到源轨道和剪辑索引
      prevTracks.forEach(track => {
        const clipIndex = track.clips.findIndex(clip => clip.id === dataObj.id);
        if (clipIndex !== -1) {
          sourceTrackId = track.id;
          sourceClipIndex = clipIndex;
        }
      });

      // 从源轨道移除剪辑
      let newTracks = prevTracks.map(track => {
        if (track.id === sourceTrackId) {
          const newClips = track.clips.filter(clip => clip.id !== dataObj.id);
          return {
            ...track,
            clips: newClips,
          };
        }
        return track;
      });

      // 将剪辑添加到指定轨道
      newTracks = newTracks.map(track => {
        if (track.id === trackId) {
          let newClips = [...track.clips];
          let clip = {
            name: dataObj.name,
            id: `clip-${track.clips.length + 1}`,
            width: dataObj.width,
            xPosition: dataObj.xPosition
          };
          newClips.push(clip);
          return {
            ...track,
            clips: newClips,
          };
        }
        return track;
      });

      // 过滤掉没有剪辑的轨道
      return newTracks.filter(track => track.clips.length > 0);
    });
  };

  const handleBetweenTracksDrop = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    setHighlightBetweenTracksId(null); // 移除高亮
    const data = event.dataTransfer.getData("text");
    const dataObj = JSON.parse(data);

    setTracks((prevTracks) => {
      let sourceTrackId = "";
      let sourceClipIndex = -1;

      // 找到源轨道和剪辑索引
      prevTracks.forEach(track => {
        const clipIndex = track.clips.findIndex(clip => clip.id === dataObj.id);
        if (clipIndex !== -1) {
          sourceTrackId = track.id;
          sourceClipIndex = clipIndex;
        }
      });

      // 从源轨道移除剪辑
      let newTracks = prevTracks.map(track => {
        if (track.id === sourceTrackId) {
          const newClips = track.clips.filter(clip => clip.id !== dataObj.id);
          return {
            ...track,
            clips: newClips,
          };
        }
        return track;
      });

      // 在 index 位置插入新轨道并添加剪辑
      let clip = {name: dataObj.name, id: 'clip-1', width: dataObj.width, xPosition: dataObj.xPosition};
      let track = {id: `track-${trackIdSeq++}`, clips: [clip]};
      setTrackIdSeq(trackIdSeq);

      newTracks = [
        ...newTracks.slice(0, index + 1),
        track,
        ...newTracks.slice(index + 1),
      ];

      // 过滤掉没有剪辑的轨道
      return newTracks.filter(track => track.clips.length > 0);
    });
  };

  const handleBetweenTracksDragEnter = (event: React.DragEvent<HTMLDivElement>, index: number) => {
    setHighlightBetweenTracksId(`mid-${index}`);
  };

  const handleBetweenTracksDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    setHighlightBetweenTracksId(null);
  };

  const handleTimelineClipDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setHighlightTrackId(null); // 移除高亮
    const data = event.dataTransfer.getData("text");
    const dataObj = JSON.parse(data);

    setTracks((prevTracks) => {
      let sourceTrackId = "";
      let sourceClipIndex = -1;

      // 找到源轨道和剪辑索引
      prevTracks.forEach(track => {
        const clipIndex = track.clips.findIndex(clip => clip.id === dataObj.id);
        if (clipIndex !== -1) {
          sourceTrackId = track.id;
          sourceClipIndex = clipIndex;
        }
      });

      // 从源轨道移除剪辑
      let newTracks = prevTracks.map(track => {
        if (track.id === sourceTrackId) {
          const newClips = track.clips.filter(clip => clip.id !== dataObj.id);
          return {
            ...track,
            clips: newClips,
          };
        }
        return track;
      });

      // 在新的轨道中添加剪辑
      let clip = {name: dataObj.name, id: `clip-1`, width: dataObj.width, xPosition: dataObj.xPosition};
      let track = {id: `track-${trackIdSeq++}`, clips: [clip]};
      setTrackIdSeq(trackIdSeq);
      newTracks.push(track);
      // 过滤掉没有剪辑的轨道
      return newTracks.filter(track => track.clips.length > 0);
    });
  };

  return (
    <div
      id="timeline"
      style={{padding: 24, textAlign: 'center', minHeight: '100%', background: '#f0f2f5'}}
      onDrop={handleTimelineClipDrop}
      onDragOver={handleClipDragOver}
    >
      {tracks.length === 0 ? (
        <div style={{padding: '50px', border: '1px dashed #d9d9d9', borderRadius: '4px', background: '#fff'}}>
          <p style={{color: '#999', fontSize: '16px'}}>Drag and drop media here</p>
        </div>
      ) : (
        tracks.filter(track => track.clips.length > 0).map((track, index) => (
          <div key={track.id} style={{marginBottom: '10px'}}>
            <div id={`track-${index}`}
                 style={{
                   display: 'flex',
                   flexDirection: 'row',
                   border: '1px solid #000',
                   background: highlightTrackId === track.id ? '#FFe000' : '#fff' // 高亮样式
                 }}
                 onDragEnter={(event) => handleClipDragEnter(event, track.id)}
                 onDragLeave={handleClipDragLeave}
            >
              <div style={{padding: '10px', background: '#eee',width: '100px'}}>
                {track.id}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  background: '#fff',
                  flex: 1,
                }}
                onDrop={(event) => handleTrackDrop(event, track.id)}
                onDragOver={handleClipDragOver}
              >
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    style={{
                      width: `${clip.width}px`,
                      height: '50px',
                      background: '#b3d9ff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginRight: '5px',
                    }}
                    draggable
                    onDragStart={(event) => handleClipDragStart(event, clip)}
                    onDragOver={handleClipDragOver}
                  >
                    {clip.name}
                  </div>
                ))}
              </div>
            </div>
            {index < tracks.length - 1 && (
              <div id={`mid-${index}`}
                   style={{
                     height: '10px',
                     background: highlightBetweenTracksId === `mid-${index}` ? '#FFe000' : '#f0f2f5', // 高亮样式
                     border: '1px dashed #d9d9d9',
                     margin: '5px 0',
                   }}
                   onDrop={(event) => handleBetweenTracksDrop(event, index)}
                   onDragEnter={(event) => handleBetweenTracksDragEnter(event, index)}
                   onDragLeave={handleBetweenTracksDragLeave}
                   onDragOver={handleClipDragOver}
              ></div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default VideoEditorTimeline;
