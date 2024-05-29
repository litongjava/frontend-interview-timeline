import React from 'react';
import {Upload, message} from 'antd';
import {InboxOutlined} from "@ant-design/icons";
import {customEmptyUploadRequest} from "@/services/systemService";

const {Dragger} = Upload;

interface VideoUploaderProps {
  fileList: any[];
  setFileList: React.Dispatch<React.SetStateAction<any[]>>;
  handleFileDragStart: (event: React.DragEvent<HTMLDivElement>, file: any) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({fileList, setFileList, handleFileDragStart}) => {
  const [messageApi, contextHolder] = message.useMessage();

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
    </>
  );
};

export default VideoUploader;
