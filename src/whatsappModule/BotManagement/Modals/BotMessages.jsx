// import React, { useState, useEffect } from "react";
// import { toast } from "sonner";
// import { buildApiUrl } from "../../../utils/apiConfig";
// import AuthenticatedImage from "./AuthenticatedImage";
// import AuthenticatedDocumentLink from "./AuthenticatedDocumentLink";
// import "../CommunicationChannel.css";

// export const BotMessage = ({ bot,agentName }) => {
//   if (!bot) return null;

  
//   // Handle text messages
//   if (typeof bot === "string") {
//     return <div>{bot}</div>;
//   }

//   // Handle object format with text property
//   if (bot.text) {
//     return <div>{bot.text}</div>;
//   }
//   console.log('agentName---------------------------------------------------',agentName)

//   // ✅ FIXED: Handle template messages with proper authentication
//   if (bot.type === "template") {
//     return (
//       <div className="template-message">
//         {/* Template Header - FIXED for custom attachments */}
//         {bot.templateType === "image_text" && bot.imageUrl && (
//           <div className="template-header mb-3 relative">
//             <AuthenticatedImage
//               src={bot.imageUrl}
//               alt="Template header"
//               className="w-full h-48 object-cover rounded-lg border border-gray-200"
//               customAttachment={bot.customAttachment}
//             />
//             {bot.customAttachment && (
//               <div className="absolute top-2 right-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
//                 Custom
//               </div>
//             )}
//           </div>
//         )}

//         {bot.templateType === "document_text" && bot.documentUrl && (
//           <div className="template-header mb-3">
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
//               <div className="flex items-center space-x-3">
//                 <div className="bg-red-100 rounded-full p-2">
//                   <i className="fas fa-file-pdf text-red-600 text-lg"></i>
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-medium text-gray-800 text-sm">
//                     {bot.fileName || "Document"}
//                   </p>
//                   <div className="flex items-center gap-2">
//                     <AuthenticatedDocumentLink
//                       url={bot.documentUrl}
//                       fileName={bot.fileName}
//                       customAttachment={bot.customAttachment}
//                     >
//                       Download PDF
//                     </AuthenticatedDocumentLink>
//                     {bot.customAttachment && (
//                       <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
//                         Custom
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {bot.templateType === "video_text" && bot.videoUrl && (
//           <div className="template-header mb-3">
//             <div className="relative">
//               <video
//                 src={bot.videoUrl}
//                 className="w-full h-48 object-cover rounded-lg border border-gray-200"
//                 controls
//                 preload="metadata"
//               />
//               <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
//                 Video
//               </div>
//               {bot.customAttachment && (
//                 <div className="absolute top-2 left-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
//                   Custom
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Template Header Text */}
//         {bot.headerText && (
//           <div className="template-header-text mb-3">
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//               <p className="text-blue-800 font-medium text-sm">
//                 {bot.headerText}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Template Body */}
//         {bot.bodyText && (
//           <div className="template-body mb-3">
//             <div className="bg-white border border-gray-200 rounded-lg p-4">
//               <p className="text-gray-800 whitespace-pre-line leading-relaxed text-sm">
//                 {bot.bodyText}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Template Footer */}
//         {bot.footerText && (
//           <div className="template-footer">
//             <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
//               <p className="text-gray-600 text-xs">{bot.footerText}</p>
//             </div>
//           </div>
//         )}

//         {/* Fallback for text-only templates */}
//         {bot.templateType === "text_only" &&
//           bot.fullText &&
//           !bot.headerText &&
//           !bot.bodyText && (
//             <div className="template-text">
//               <p className="text-gray-800 whitespace-pre-line leading-relaxed">
//                 {bot.fullText}
//               </p>
//             </div>
//           )}
//       </div>
//     );
//   }

//   // Handle object format with content property (for text)
//   if (bot.content && !bot.mediaType && !bot.type) {
//     return <div>{bot.content}</div>;
//   }

//   // Handle object format with type and content
//   if (bot.type === "text" && bot.content) {
//     return <div>{bot.content}</div>;
//   }

//   // Handle image messages - FIXED for authenticated access
//   if (
//     (bot.type === "image" || bot.mediaType === "image") &&
//     (bot.imageUrl || bot.mediaUrl)
//   ) {
//     return (
//       <div className="user-media-message">
//         <div className="media-container">
//           <AuthenticatedImage
//             src={bot.imageUrl || bot.mediaUrl}
//             alt="Bot sent"
//             className="user-image"
//             style={{ cursor: "zoom-in" }}
//             onClick={(e) => {
//               e.stopPropagation();
//               // You can implement image preview/modal here
//             }}
//             customAttachment={bot.customAttachment}
//           />
//         </div>
//         {(bot.caption || bot.content) && (
//           <div className="media-caption">{bot.caption || bot.content}</div>
//         )}
//       </div>
//     );
//   }

//   // Handle video messages - FIXED for authenticated access
//   if (
//     (bot.type === "video" || bot.mediaType === "video") &&
//     (bot.videoUrl || bot.mediaUrl)
//   ) {
//     return (
//       <div className="user-media-message">
//         <div className="video-container">
//           <video controls className="user-video">
//             <source src={bot.videoUrl || bot.mediaUrl} type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>
//         </div>
//         {(bot.caption || bot.content) && (
//           <div className="media-caption">{bot.caption || bot.content}</div>
//         )}
//       </div>
//     );
//   }

//   // Handle document messages - FIXED for authenticated access
//   if (
//     (bot.type === "document" || bot.mediaType === "document") &&
//     (bot.documentUrl || bot.mediaUrl)
//   ) {
//     return (
//       <div className="user-media-message">
//         <div className="document-container">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
//             <div className="flex items-center space-x-3">
//               <div className="bg-red-100 rounded-full p-2">
//                 <i className="fas fa-file-pdf text-red-600 text-lg"></i>
//               </div>
//               <div>
//                 <p className="font-medium text-gray-800 text-sm">
//                   {bot.fileName || "Document"}
//                 </p>
//                 <AuthenticatedDocumentLink
//                   url={bot.documentUrl || bot.mediaUrl}
//                   fileName={bot.fileName}
//                   customAttachment={bot.customAttachment}
//                 >
//                   Download
//                 </AuthenticatedDocumentLink>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Handle audio messages
//   if (
//     (bot.type === "audio" || bot.mediaType === "audio") &&
//     (bot.audioUrl || bot.mediaUrl)
//   ) {
//     return (
//       <div className="user-media-message">
//         <div className="audio-container">
//           <audio controls className="user-audio">
//             <source src={bot.audioUrl || bot.mediaUrl} type="audio/mpeg" />
//             Your browser does not support the audio tag.
//           </audio>
//         </div>
//       </div>
//     );
//   }

//   // Handle button messages
//   if (bot.type === "buttons" && bot.buttons) {
//     return (
//       <div className="bot-message-container">
//         <div className="bot-message-text">{bot.content}</div>
//         <div className="bot-message-buttons">
//           {bot.buttons.map((button, index) => (
//             <button key={index} className="bot-button">
//               {button}
//             </button>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // Handle carousel messages
//   if (bot.type === "carousel" && bot.items) {
//     return (
//       <div className="bot-message-container">
//         <div className="bot-message-text">{bot.content}</div>
//         <div className="bot-carousel">
//           {bot.items.map((item, index) => (
//             <div key={index} className="carousel-item">
//               <div className="carousel-item-title">{item.title}</div>
//               <div className="carousel-item-desc">{item.description}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // Fallback for unknown formats
//   return <div>{JSON.stringify(bot)}</div>;
// };

// export default BotMessage;

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { buildApiUrl } from "../../../utils/apiConfig";
import AuthenticatedImage from "./AuthenticatedImage";
import AuthenticatedDocumentLink from "./AuthenticatedDocumentLink";
import "../CommunicationChannel.css";
import { Badge } from "../../../components/ui/badge";

export const BotMessage = ({ bot, agentName }) => {
  if (!bot) return null;

  // Use "Bot" as default if agentName is null or undefined
  const senderName = agentName || "Bot";

  return (
    <div className="bot-message-container">
      {/* Display the agent name above the message */}
      <div className="message-header flex items-center space-x-2">
  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-200 to-blue-100 text-blue-500 font-small text-xs">
    <i className="fas fa-user text-blue-500 mr-1"></i> {senderName}
  </span>
</div>

      {/* Handle text messages */}
      {typeof bot === "string" ? (
        <div>{bot}</div>
      ) : bot.text ? (
        <div>{bot.text}</div>
      ) : (
        <>
          {/* ✅ FIXED: Handle template messages with proper authentication */}
          {bot.type === "template" && (
            <div className="template-message">
              {/* Template Header - FIXED for custom attachments */}
              {bot.templateType === "image_text" && bot.imageUrl && (
                <div className="template-header mb-3 relative">
                  <AuthenticatedImage
                    src={bot.imageUrl}
                    alt="Template header"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    customAttachment={bot.customAttachment}
                  />
                  {bot.customAttachment && (
                    <div className="absolute top-2 right-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                      Custom
                    </div>
                  )}
                </div>
              )}

              {bot.templateType === "document_text" && bot.documentUrl && (
                <div className="template-header mb-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <i className="fas fa-file-pdf text-red-600 text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">
                          {bot.fileName || "Document"}
                        </p>
                        <div className="flex items-center gap-2">
                          <AuthenticatedDocumentLink
                            url={bot.documentUrl}
                            fileName={bot.fileName}
                            customAttachment={bot.customAttachment}
                          >
                            Download PDF
                          </AuthenticatedDocumentLink>
                          {bot.customAttachment && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                              Custom
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {bot.templateType === "video_text" && bot.videoUrl && (
                <div className="template-header mb-3">
                  <div className="relative">
                    <video
                      src={bot.videoUrl}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      controls
                      preload="metadata"
                    />
                    <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      Video
                    </div>
                    {bot.customAttachment && (
                      <div className="absolute top-2 left-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                        Custom
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Template Header Text */}
              {bot.headerText && (
                <div className="template-header-text mb-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 font-medium text-sm">
                      {bot.headerText}
                    </p>
                  </div>
                </div>
              )}

              {/* Template Body */}
              {bot.bodyText && (
                <div className="template-body mb-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed text-sm">
                      {bot.bodyText}
                    </p>
                  </div>
                </div>
              )}

              {/* Template Footer */}
              {bot.footerText && (
                <div className="template-footer">
                  <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-600 text-xs">{bot.footerText}</p>
                  </div>
                </div>
              )}

              {/* Fallback for text-only templates */}
              {bot.templateType === "text_only" &&
                bot.fullText &&
                !bot.headerText &&
                !bot.bodyText && (
                  <div className="template-text">
                    <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                      {bot.fullText}
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* Handle object format with content property (for text) */}
          {bot.content && !bot.mediaType && !bot.type && <div>{bot.content}</div>}

          {/* Handle object format with type and content */}
          {bot.type === "text" && bot.content && <div>{bot.content}</div>}

          {/* Handle image messages - FIXED for authenticated access */}
          {(bot.type === "image" || bot.mediaType === "image") &&
            (bot.imageUrl || bot.mediaUrl) && (
              <div className="user-media-message">
                <div className="media-container">
                  <AuthenticatedImage
                    src={bot.imageUrl || bot.mediaUrl}
                    alt="Bot sent"
                    className="user-image"
                    style={{ cursor: "zoom-in" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // You can implement image preview/modal here
                    }}
                    customAttachment={bot.customAttachment}
                  />
                </div>
                {(bot.caption || bot.content) && (
                  <div className="media-caption">{bot.caption || bot.content}</div>
                )}
              </div>
            )}

          {/* Handle video messages - FIXED for authenticated access */}
          {(bot.type === "video" || bot.mediaType === "video") &&
            (bot.videoUrl || bot.mediaUrl) && (
              <div className="user-media-message">
                <div className="video-container">
                  <video controls className="user-video">
                    <source src={bot.videoUrl || bot.mediaUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                {(bot.caption || bot.content) && (
                  <div className="media-caption">{bot.caption || bot.content}</div>
                )}
              </div>
            )}

          {/* Handle document messages - FIXED for authenticated access */}
          {(bot.type === "document" || bot.mediaType === "document") &&
            (bot.documentUrl || bot.mediaUrl) && (
              <div className="user-media-message">
                <div className="document-container">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
                    <div className="flex items-center space-x-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <i className="fas fa-file-pdf text-red-600 text-lg"></i>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {bot.fileName || "Document"}
                        </p>
                        <AuthenticatedDocumentLink
                          url={bot.documentUrl || bot.mediaUrl}
                          fileName={bot.fileName}
                          customAttachment={bot.customAttachment}
                        >
                          Download
                        </AuthenticatedDocumentLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Handle audio messages */}
          {(bot.type === "audio" || bot.mediaType === "audio") &&
            (bot.audioUrl || bot.mediaUrl) && (
              <div className="user-media-message">
                <div className="audio-container">
                  <audio controls className="user-audio">
                    <source src={bot.audioUrl || bot.mediaUrl} type="audio/mpeg" />
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              </div>
            )}

          {/* Handle button messages */}
          {bot.type === "buttons" && bot.buttons && (
            <div className="bot-message-buttons">
              {bot.buttons.map((button, index) => (
                <button key={index} className="bot-button">
                  {button}
                </button>
              ))}
            </div>
          )}

          {/* Handle carousel messages */}
          {bot.type === "carousel" && bot.items && (
            <div className="bot-carousel">
              {bot.items.map((item, index) => (
                <div key={index} className="carousel-item">
                  <div className="carousel-item-title">{item.title}</div>
                  <div className="carousel-item-description">{item.description}</div>
                  {/* Include additional item details (like image or link) */}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
