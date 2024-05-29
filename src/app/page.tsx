"use client"
import React from 'react';
import {Layout, message, Upload} from 'antd';
// @ts-ignore
import {InboxOutlined} from "@ant-design/icons";
import {customEmptyUploadRequest} from "@/services/systemService";
import {envProxy} from "next/dist/build/turborepo-access-trace/env";

const {Dragger} = Upload;
const {Header, Content, Sider} = Layout;

type Clip = { name: string, id: string, width: number };
type Track = { id: string, clips: Clip[] };

export default function Index() {
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [fileList, setFileList] = React.useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const handleFileDragStart = async (event: any, file: any) => {
    let transferData = {
      name: file.name,
      width: 300
    };
    const data = JSON.stringify(transferData);
    console.log("data:", data);
    event.dataTransfer.setData("text", data);
  };

  const handleTimelineClipDrop = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    const data = event.dataTransfer.getData("text");
    const dataObj = JSON.parse(data);

    setTracks((prevTracks) => [
      ...prevTracks,
      {id: `track-${prevTracks.length + 1}`, clips: [{name: dataObj.name, id: 'clip-1', width: dataObj.width}]},
    ]);
  };

  const handleTrackClipDrop = (event: any, trackId: string, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    const data = event.dataTransfer.getData("text");
    const dataObj = JSON.parse(data);

    if (trackId) {
      setTracks((prevTracks) =>
        prevTracks.map((track) =>
          track.id === trackId
            ? {
              ...track,
              clips: [...track.clips, {name: dataObj.name, id: `clip-${track.clips.length + 1}`, width: dataObj.width}],
            }
            : track
        )
      );
    } else if (index !== undefined) {
      setTracks((prevTracks) => [
        ...prevTracks.slice(0, index + 1),
        {id: `track-${prevTracks.length + 1}`, clips: [{name: dataObj.name, id: 'clip-1', width: dataObj.width}]},
        ...prevTracks.slice(index + 1),
      ]);
    }
  };

  const handleClipDragOver = (event: any) => {
    event.preventDefault();
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
                tracks.map((track, index) => (
                  <div key={track.id} style={{marginBottom: '10px'}}>
                    <div style={{display: 'flex', flexDirection: 'row', border: '1px solid #000'}}>
                      <div style={{padding: '10px', background: '#eee', marginRight: '10px', width: '100px'}}>
                        {track.id}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          padding: '10px',
                          background: '#fff',
                          flex: 1,
                        }}
                        onDrop={(event) => handleTrackClipDrop(event, track.id, index)}
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
                        onDrop={(event) => handleTrackClipDrop(event, "", index)}
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
