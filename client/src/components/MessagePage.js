import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import Avatar from './Avatar'
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaPlus, FaImage, FaVideo } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import uploadFile from '../helpers/uploadFile';
import Loading from './Loading';
import backgroundImage from '../assets/wallapaper.jpeg'
import moment from 'moment'

const MessagePage = () => {
  const params = useParams()
  const socketConnection = useSelector(state => state?.user?.socketConnection)
  const user = useSelector(state => state?.user)
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: ""
  })
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false)
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  })
  const [loading, setLoading] = useState(false)
  const [allMessage, setAllMessage] = useState([])
  const currentMessage = useRef(null)

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [allMessage])

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload(preve => !preve)
  }

  const handleUploadImage = async (e) => {
    const file = e.target.files[0]
    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)
    setMessage(preve => ({ ...preve, imageUrl: uploadPhoto.url }))
  }

  const handleClearUploadImage = () => {
    setMessage(preve => ({ ...preve, imageUrl: "" }))
  }

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0]
    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)
    setMessage(preve => ({ ...preve, videoUrl: uploadPhoto.url }))
  }

  const handleClearUploadVideo = () => {
    setMessage(preve => ({ ...preve, videoUrl: "" }))
  }

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId)
      socketConnection.emit('seen', params.userId)

      socketConnection.on('message-user', (data) => {
        setDataUser(data)
      })

      socketConnection.on('message', (data) => {
        setAllMessage(data)
      })
    }
  }, [socketConnection, params?.userId, user])

  const handleOnChange = (e) => {
    setMessage(preve => ({ ...preve, text: e.target.value }))
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        socketConnection.emit('new message', {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id
        })
        setMessage({ text: "", imageUrl: "", videoUrl: "" })
      }
    }
  }

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className='bg-no-repeat bg-cover'>
      <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
        <div className='flex items-center gap-4'>
          <Link to={"/"} className='lg:hidden'><FaAngleLeft size={25} /></Link>
          <Avatar width={50} height={50} imageUrl={dataUser?.profile_pic} name={dataUser?.name} userId={dataUser?._id} />
          <div>
            <h3 className='font-semibold text-lg'>{dataUser?.name}</h3>
            <p className='text-sm'>
              {dataUser.online ? <span className='text-primary'>online</span> : <span className='text-slate-400'>offline</span>}
            </p>
          </div>
        </div>
        <button className='hover:text-primary'><HiDotsVertical /></button>
      </header>

      {/* Chat Messages */}
      <section className='h-[calc(100vh-128px)] overflow-y-auto scrollbar bg-slate-100 bg-opacity-60 px-3 py-2'>
        <div className='flex flex-col gap-2' ref={currentMessage}>
          {Object.entries(
            allMessage.reduce((acc, msg) => {
              const date = moment(msg.createdAt).format('DD MMM YYYY');
              acc[date] = acc[date] || [];
              acc[date].push(msg);
              return acc;
            }, {})
          ).map(([date, messages], dateIndex) => (
            <React.Fragment key={dateIndex}>
              <div className='flex justify-center my-2'>
                <span className='bg-gray-300 text-sm px-3 py-1 rounded-full shadow text-gray-700'>
                  {date === moment().format('DD MMM YYYY') ? 'Today' : date}
                </span>
              </div>
              {messages.map((msg, index) => {
                const isSender = user._id === msg?.msgByUserId;
                return (
                  <div key={index} className={`flex ${isSender ? 'justify-end' : 'justify-start'} px-2`}>
                    <div className={`relative p-2 rounded-lg w-fit max-w-[85%] ${isSender ? 'bg-teal-100' : 'bg-white'} shadow-md`}>
                      {!isSender && (
                        <div className="absolute -left-10 top-0">
                          <Avatar
                            width={30}
                            height={30}
                            imageUrl={dataUser?.profile_pic}
                            name={dataUser?.name}
                            userId={dataUser?._id}
                          />
                        </div>
                      )}
                      {msg?.imageUrl && (
                        <img src={msg.imageUrl} className="w-full h-auto object-scale-down rounded mb-1" alt="img" />
                      )}
                      {msg?.videoUrl && (
                        <video src={msg.videoUrl} className="w-full h-auto object-scale-down rounded mb-1" controls />
                      )}
                      {msg.text && <p className="text-sm break-words">{msg.text}</p>}
                      <p className="text-[10px] text-gray-500 text-right mt-1">
                        {moment(msg.createdAt).format('hh:mm A')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>


        {message.imageUrl && (
          <div className='w-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center'>
            <div className='absolute top-0 right-0 p-2 cursor-pointer text-white' onClick={handleClearUploadImage}><IoClose size={28} /></div>
            <img src={message.imageUrl} alt='upload' className='max-w-sm m-2 object-scale-down rounded bg-white p-3' />
          </div>
        )}

        {message.videoUrl && (
          <div className='w-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center'>
            <div className='absolute top-0 right-0 p-2 cursor-pointer text-white' onClick={handleClearUploadVideo}><IoClose size={28} /></div>
            <video src={message.videoUrl} controls muted autoPlay className='max-w-sm m-2 object-scale-down rounded bg-white p-3' />
          </div>
        )}

        {loading && <div className='w-full flex justify-center items-center sticky bottom-0'><Loading /></div>}
      </section>

      {/* Send Message */}
      <section className='h-16 bg-white flex items-center px-4'>
        <div className='relative'>
          <button onClick={handleUploadImageVideoOpen} className='flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white'><FaPlus size={20} /></button>
          {openImageVideoUpload && (
            <div className='bg-white shadow rounded absolute bottom-14 w-36 p-2 z-10'>
              <form>
                <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'><FaImage className='text-primary' /><p>Image</p></label>
                <label htmlFor='uploadVideo' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'><FaVideo className='text-purple-500' /><p>Video</p></label>
                <input type='file' id='uploadImage' onChange={handleUploadImage} className='hidden' />
                <input type='file' id='uploadVideo' onChange={handleUploadVideo} className='hidden' />
              </form>
            </div>
          )}
        </div>
        <form className='h-full w-full flex gap-2' onSubmit={handleSendMessage}>
          <input type='text' placeholder='Type your message...' className='py-1 px-4 outline-none w-full h-full rounded border border-gray-300' value={message.text} onChange={handleOnChange} />
          <button className='text-primary hover:text-secondary'><IoMdSend size={28} /></button>
        </form>
      </section>
    </div>
  )
}

export default MessagePage
