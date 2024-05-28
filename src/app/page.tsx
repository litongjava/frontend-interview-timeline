// pages/index.js
"use client"
import React from 'react';
import {Layout, Upload} from 'antd';
import {InboxOutlined} from '@ant-design/icons';
//import 'antd/dist/antd.css';

const {Dragger} = Upload;
const {Header, Content, Sider} = Layout;

export default function Index() {
  const [tracks, setTracks] = React.useState([[]]);

  const handleDrop = (event) => {
    event.preventDefault();
    const newTrack = tracks.slice();
    newTrack.push([]);
    setTracks(newTrack);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <Layout style={{height: '100vh'}}>
      <Sider width={200} className="site-layout-background">
        <Dragger
          name="file"
          multiple={true}
          onChange={(info) => console.log(info.fileList)}
          showUploadList={false}
          accept="video/*"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined/>
          </p>
          <p className="ant-upload-text">Click to upload or drag file here</p>
        </Dragger>
      </Sider>
      <Layout>
        <Header className="site-layout-sub-header-background" style={{padding: 0}}>
          Video Editor
        </Header>
        <Content style={{margin: '24px 16px 0', overflow: 'initial'}}>
          <div
            style={{padding: 24, textAlign: 'center', background: '#fff', minHeight: '100%'}}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {tracks.map((track, index) => (
              <div key={index} style={{border: '1px solid #000', marginBottom: '10px'}}>
                Track {index + 1}
              </div>
            ))}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
