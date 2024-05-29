//src/app/page.tsx
"use client"
import React from 'react';
import {Layout, message, Upload} from 'antd';
// @ts-ignore
import {InboxOutlined} from "@ant-design/icons";
import {customEmptyUploadRequest} from "@/services/systemService";
//import 'antd/dist/antd.css';

const {Dragger} = Upload;
const {Header, Content, Sider} = Layout;

export default function Index() {
  const [tracks, setTracks] = React.useState<{ name: string, id: string, width: number }[]>([]);
  const [fileList, setFileList] = React.useState<any[]>([]);
  const [messageApi, contextHolder] = message.useMessage()

  const handleFileDragStart = async (event: any, file: any) => {
    let transferData = {
      name: file.name,
      width: 300
    }
    const data = JSON.stringify(transferData);
    console.log("data:", data)
    event.dataTransfer.setData("text", data);
  };

  const handleClicpDrop = (event: any) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    console.log("data", data)
    const dataObj = JSON.parse(data);
    const newTrack = [...tracks, {name: dataObj.name, id: `track-${tracks.length + 1}`, width: dataObj.width}];
    setTracks(newTrack);
  };

  const handleClicpDragOver = (event: any) => {
    event.preventDefault();
  };


  const handleChange = (info: any) => {
    let newFileList = [...info.fileList];

    // Only include files with status 'done'
    newFileList = newFileList.filter(file => file.status === 'done');
    // Read from response and show file link
    newFileList = newFileList.map((file) => {
      if (file.response) {
        // Component will show file.url as link
        file.url = file.response.url;
      }
      // if (file.originFileObj) {
      //   const duration = getVideoDuration(file.originFileObj);
      //   file.duration = duration
      // }
      return file;
    });

    setFileList(newFileList);
    if (info.file.status === 'done') {
      messageApi.success(`${info.file.name} file uploaded successfully.`);
    } else if (info.file.status === 'error') {
      messageApi.error(`${info.file.name} file upload failed.`);
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
              <p className="ant-upload-text">Click to upload or drag file here</p>
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
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>
        </Sider>
        <Layout>
          <Header style={{padding: 0, background: '#fff'}}>
            Video Editor Timeline
          </Header>
          <Content style={{margin: '24px 16px 0', overflow: 'initial'}}>
            <div id="timeline"
                 style={{padding: 24, textAlign: 'center', minHeight: '100%', background: '#f0f2f5'}}
                 onDrop={handleClicpDrop}
                 onDragOver={handleClicpDragOver}
            >
              {tracks.length === 0 ? (
                <div style={{padding: '50px', border: '1px dashed #d9d9d9', borderRadius: '4px', background: '#fff'}}>
                  <p style={{color: '#999', fontSize: '16px'}}>Drag and drop media here</p>
                </div>
              ) : (
                tracks.map((track, index) => (
                  <div key={track.id} style={{border: '1px solid #000', marginBottom: '10px'}}>
                    <div style={{
                      width: `${track.width}px`,
                      height: '30px',
                      background: '#b3d9ff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {track.name}
                    </div>
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
