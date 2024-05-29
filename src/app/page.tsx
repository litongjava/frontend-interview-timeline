"use client"
import React from 'react';
import {Layout, message, Upload} from 'antd';
// @ts-ignore
import {InboxOutlined} from "@ant-design/icons";
import {customEmptyUploadRequest} from "@/services/systemService";
import {envProxy} from "next/dist/build/turborepo-access-trace/env";

const {Dragger} = Upload;
const {Header, Content, Sider} = Layout;

type Clip = { name: string, id: string, width: number, xPosition: number };
type Track = { id: string, clips: Clip[] };

export default function Index() {
  const [tracks, setTracks] = React.useState<Track[]>([]);
  let [trackIdSeq, setTrackIdSeq] = React.useState<number>(0);
  const [fileList, setFileList] = React.useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [highlightTrackId, setHighlightTrackId] = React.useState<string | null>(null);

  const handleFileDragStart = (event: any, file: any) => {
    let transferData = {
      name: file.name,
      width: 300,
      xPosition: event.clientX,
    };
    const data = JSON.stringify(transferData);
    event.dataTransfer.setData("text", data);
  };

  const handleClipDragStart = (event: any, clip: Clip) => {
    const data = JSON.stringify(clip);
    event.dataTransfer.setData("text", data);
  }

  const handleTimelineClipDrop = (event: any) => {
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
      let clip = { name: dataObj.name, id: `clip-1`, width: dataObj.width, xPosition: dataObj.xPosition };
      let track = { id: `track-${trackIdSeq++}`, clips: [clip] };
      setTrackIdSeq(trackIdSeq);

      newTracks.push(track);

      // 过滤掉没有剪辑的轨道
      return newTracks.filter(track => track.clips.length > 0);
    });
  };

  const handleTrackDrop = (event: any, trackId?: string, index?: number) => {
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

      // 如果提供了 trackId，将剪辑添加到指定轨道
      if (trackId) {
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
      } else if (index !== undefined) {
        // 如果没有提供 trackId，在 index 位置插入新轨道并添加剪辑
        let clip = { name: dataObj.name, id: 'clip-1', width: dataObj.width, xPosition: dataObj.xPosition };
        let track = { id: `track-${trackIdSeq++}`, clips: [clip] };
        setTrackIdSeq(trackIdSeq);

        newTracks = [
          ...newTracks.slice(0, index + 1),
          track,
          ...newTracks.slice(index + 1),
        ];
      }

      // 过滤掉没有剪辑的轨道
      return newTracks.filter(track => track.clips.length > 0);
    });
  };

  const handleClipDrop = (event: any, targetTrackId: string, targetClipId: string) => {
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

  const handleClipDragOver = (event: any) => {
    event.preventDefault();
  };

  const handleClipDragEnter = (event: any, trackId: string) => {
    setHighlightTrackId(trackId);
  };

  const handleClipDragLeave = (event: any) => {
    setHighlightTrackId(null);
  };

  const handleChange = (info: any) => {
    let newFileList = [...info.fileList];

    // 只包括状态为 'done' 的文件
    newFileList = newFileList.filter(file => file.status === 'done');
    // 从响应中读取并显示文件链接
    newFileList = newFileList.map((file) => {
      if (file.response) {
        // 组件将显示 file.url 作为链接
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);
    if (info.file.status === 'done') {
      messageApi.success(`${info.file.name} 文件上传成功。`);
    } else if (info.file.status === 'error') {
      messageApi.error(`${info.file.name} 文件上传失败。`);
    }
  };


  return (
    <>
      {contextHolder}

      <Layout style={{height: '100vh'}}>
        <Sider width={200} style={{background: '#fff'}}>
          <div>
            <Dragger
              name="file"
              multiple={true}
              onChange={handleChange}
              showUploadList={false}
              customRequest={customEmptyUploadRequest}
              accept="video/*"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined/>
              </p>
              <p className="ant-upload-text">点击上传或拖拽文件到这里</p>
            </Dragger>
          </div>
          <div>
            {fileList.map((file, index) => (
              <div
                key={index}
                style={{marginTop: 10}}
                draggable
                onDragStart={(event) => handleFileDragStart(event, file)}
              >
                <video width="100%" controls>
                  <source src={URL.createObjectURL(file.originFileObj)} type="video/mp4"/>
                  您的浏览器不支持 video 标签。
                </video>
              </div>
            ))}
          </div>
        </Sider>
        <Layout>
          <Header style={{padding: 0, background: '#fff'}}>
            视频编辑时间线
          </Header>
          <Content style={{margin: '24px 16px 0', overflow: 'initial'}}>
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
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        border: '1px solid #000',
                        background: highlightTrackId === track.id ? '#FFe000' : '#fff' // 高亮样式
                      }}
                      onDragEnter={(event) => handleClipDragEnter(event, track.id)}
                      onDragLeave={handleClipDragLeave}
                    >
                      <div style={{padding: '10px', background: '#eee', marginRight: '10px', width: '100px'}}>
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
                        onDrop={(event) => handleTrackDrop(event, track.id, index)}
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
                      <div
                        style={{
                          height: '10px',
                          background: '#f0f2f5',
                          border: '1px dashed #d9d9d9',
                          margin: '5px 0',
                        }}
                        onDrop={(event) => handleTrackDrop(event, "", index)}
                        onDragOver={handleClipDragOver}
                      ></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
