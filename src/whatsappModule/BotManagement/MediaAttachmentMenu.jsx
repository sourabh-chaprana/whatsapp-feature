// import React from "react";

// const MediaAttachmentMenu = ({ onSelect, onClose }) => {
//   const mediaOptions = [
//     { id: "photos", icon: "fa-images", label: "Photos", type: "image/*" },
//     { id: "camera", icon: "fa-camera", label: "Camera", type: "image/*", capture: "environment" },
//     { id: "document", icon: "fa-file", label: "Document", type: ".pdf,.doc,.docx,.xls,.xlsx,.txt" },
//     { id: "location", icon: "fa-map-marker-alt", label: "Location" },
//     { id: "contact", icon: "fa-user", label: "Contact" },
//     { id: "video", icon: "fa-video", label: "Video", type: "video/*" },
//     { id: "audio", icon: "fa-microphone", label: "Audio", type: "audio/*" },
//   ];

//   const handleOptionClick = (option) => {
//     onSelect(option);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50" onClick={onClose}>
//       <div className="w-full max-w-md p-4 bg-gray-100 rounded-t-xl" onClick={(e) => e.stopPropagation()}>
//         <div className="grid grid-cols-4 gap-6 py-6">
//           {mediaOptions.map((option) => (
//             <button
//               key={option.id}
//               className="flex flex-col items-center justify-center"
//               onClick={() => handleOptionClick(option)}
//             >
//               <div className="w-16 h-16 mb-2 flex items-center justify-center bg-white rounded-full shadow-md">
//                 <i className={`fas ${option.icon} text-2xl ${option.id === "photos" ? "text-blue-500" : 
//                   option.id === "document" ? "text-cyan-500" : 
//                   option.id === "location" ? "text-green-500" : 
//                   option.id === "contact" ? "text-gray-500" : 
//                   option.id === "video" ? "text-red-500" : 
//                   option.id === "audio" ? "text-purple-500" : 
//                   option.id === "camera" ? "text-gray-700" : "text-gray-600"}`}></i>
//               </div>
//               <span className="text-sm font-medium">{option.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MediaAttachmentMenu; 