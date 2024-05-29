"use client"
import React from 'react';
import {Layout, message, Upload} from 'antd';
// @ts-ignore
import {InboxOutlined} from "@ant-design/icons";
import VideoUploader from "@/components/VideoUploader";
import VideoEditorTimeline from "@/components/VideoEditorTimeline";

const {Dragger} = Upload;
const {Header, Content, Sider} = Layout;

type Clip = { name: string, id: string, width: number, xPosition: number };
type Track = { id: string, clips: Clip[] };

export default function Index() {
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [trackIdSeq, setTrackIdSeq] = React.useState<number>(0);
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
          <VideoUploader fileList={fileList} setFileList={setFileList} handleFileDragStart={handleFileDragStart}/>
        </Sider>
        <Layout>
          <Header style={{padding: 0, background: '#fff'}}>
            视频编辑时间线
          </Header>
          <Content style={{margin: '24px 16px 0', overflow: 'initial'}}>
            <VideoEditorTimeline
              tracks={tracks}
              setTracks={setTracks}
              trackIdSeq={trackIdSeq}
              setTrackIdSeq={setTrackIdSeq}
              highlightTrackId={highlightTrackId}
              setHighlightTrackId={setHighlightTrackId}
            />
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
