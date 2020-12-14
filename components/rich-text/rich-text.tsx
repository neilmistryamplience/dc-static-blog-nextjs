import React, { FunctionComponent } from 'react';
import ReactMarkdown from 'react-markdown';
import markdown from '../markdown-renderers/markdown';
import Picture from '../picture/picture';
import Video from '../videos/video.component';

const MARKDOWN_RENDERERS = { ...markdown };


/*const RichText = ({ children }: RichTextProps): ReactElement => <>{children}</>;

export default RichText;*/

const RichText: FunctionComponent<any> = ({
  content:{
      richtext = []
  }
}:any) => {
  return (
      <>
          {
              richtext.map((item: any, index:Number) => {
                  const {
                      type,
                      data
                  } = item;

                  switch(type) {
                      case 'markdown':
                          return (
                            <div key={`text${index}`}>
                              <ReactMarkdown source={data} renderers={MARKDOWN_RENDERERS} />
                            </div>
                          );
                      case 'dc-content-link':
                        if( data._meta.schema == "https://raw.githubusercontent.com/emilygodfrey/dc-static-blog-nextjs/eu-sfcc-presales/schemas/image.json"){
                            return (
                                <div key={data.image.id}>
                                <Picture
                                  image={data}
                                  sources={[
                                    {
                                      di: { w: 675, scaleFit: 'poi' },
                                      media: '(min-width: 415px)'
                                    },
                                    {
                                      di: { w: 414, scaleFit: 'poi' }
                                    }
                                  ]}
                                />
                              </div>
                                );
                        }else if( data._meta.schema == "https://raw.githubusercontent.com/emilygodfrey/dc-static-blog-nextjs/eu-sfcc-presales/schemas/video.json"){
                            var videoSrc = 'https://' + data.video.defaultHost + '/v/' + data.video.endpoint + '/' + data.video.name;
                            
                            var itemArray = [
                                videoSrc + '/mp4_720p?protocol=https',
                                videoSrc + '/mp4_480p?protocol=https',
                                videoSrc + '/mp4_240p?protocol=https',
                                videoSrc + '/webm_720p?protocol=https',
                                videoSrc + '/webm_480p?protocol=https',
                                videoSrc + '/web_240p?protocol=https'
                            ]
                            

                            return (
                                <div key={data.video.id} className="blog-post-video">
                                    <Video video={data.video} srcSet={itemArray} />
                                </div>
                                );
                        }else if( data._meta.schema == "https://raw.githubusercontent.com/emilygodfrey/dc-static-blog-nextjs/eu-sfcc-presales/schemas/text.json"){
                            return (
                                <div key={`text${index}`}>
                                    <ReactMarkdown source={data.text} renderers={MARKDOWN_RENDERERS} />
                                </div>
                                );
                        } else {
                            return null;
                        }


                          

                          
                          /*return (
                              <ContentBlock content={data} />
                          );*/
                      case 'dc-image-link':
                          return (
                              <picture className="amp-dc-image">
                                  <img src={`//${data.defaultHost}/i/${data.endpoint}/${encodeURIComponent(data.name)}?upscale=false&strip=true`} className="amp-dc-image-pic"/>
                              </picture>
                          );
                      default:
                          return null;
                  }
              })
          }
      </>
  )
}

export default RichText;
