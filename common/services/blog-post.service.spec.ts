/* eslint-env jest */

import blogPostContentItemFixture from '../../tests/fixtures/single-blog-post-content-item.json';
import blogPostDataFixture from '../../tests/fixtures/single-blog-post-data-object.json';
import { getBlogPostByDeliveryId, parseContent } from './blog-post.service';
import * as videoService from './video.service';

jest.mock('./video.service');

const mockGetVideoSources = (videoService.getVideoSources as unknown) as jest.Mock;

const mockGetContentItemById = jest.fn();
jest.mock('../../common/services/dynamic-content-delivery.service', () => {
  return {
    DynamicContentDeliveryService: jest.fn(() => {
      return {
        getContentItemById: () => mockGetContentItemById()
      };
    })
  };
});

describe('getBlogPostByDeliveryId', () => {
  beforeEach(() => {
    process.env.DYNAMIC_CONTENT_ACCOUNT_NAME = 'account-name';
    process.env.DYNAMIC_CONTENT_BASE_URL = 'dc-base-url';
  });

  test('should return blog post content', async () => {
    const contentItem = {
      body: blogPostContentItemFixture,
      toJSON: () => {
        return blogPostContentItemFixture;
      }
    };
    mockGetContentItemById.mockImplementation(() => contentItem);

    mockGetVideoSources.mockResolvedValue([]);

    const result = await getBlogPostByDeliveryId('test-blog-id');

    expect(result).toEqual(blogPostDataFixture);
    expect(mockGetVideoSources).toHaveBeenCalled();
  });

  test('should return blog post content when author has no avatar', async () => {
    const blogPostContentItemNoAuthorAvatarFixture = JSON.parse(JSON.stringify(blogPostContentItemFixture));
    delete blogPostContentItemNoAuthorAvatarFixture.authors[0].avatar;
    const contentItem = {
      body: blogPostContentItemNoAuthorAvatarFixture,
      toJSON: () => {
        return blogPostContentItemNoAuthorAvatarFixture;
      }
    };
    mockGetContentItemById.mockImplementation(() => contentItem);
    const blogPostDataNoAuthorAvatarFixture = JSON.parse(JSON.stringify(blogPostDataFixture));
    delete blogPostDataNoAuthorAvatarFixture.authors[0].avatar;
    const result = await getBlogPostByDeliveryId('test-blog-id');

    expect(result).toEqual(blogPostDataNoAuthorAvatarFixture);
  });

  test('should throw an error when DYNAMIC_CONTENT_ACCOUNT_NAME is not set', async () => {
    mockGetContentItemById.mockImplementation(() => {
      throw new Error();
    });
    delete process.env.DYNAMIC_CONTENT_ACCOUNT_NAME;
    await expect(getBlogPostByDeliveryId('test-blog-id')).rejects.toThrowError();
  });

  test('should throw an error when we do not get a blog post back', async () => {
    const contentItem = {
      body: {
        notBlogContent: 'no blog'
      },
      toJSON: () => {
        return {
          notBlogContent: 'no blog'
        };
      }
    };
    mockGetContentItemById.mockImplementation(() => contentItem);

    await expect(getBlogPostByDeliveryId('test-blog-id')).rejects.toThrowError();
  });
});

const mockFetch = jest.fn();
jest.mock('isomorphic-unfetch', () => () => mockFetch());

describe('parseContent', () => {
  test('should not parse image when passed as content', async () => {
    const imageContent = {
      image: {
        defaultHost: 'i1.adis.ws',
        endpoint: 'blogltd',
        name: 'casual-wear',
        id: 'e1b511d2-1a33-47e7-8dc7-f460534cb0c7',
        _meta: {
          schema: 'http://bigcontent.io/cms/schema/v1/core#/definitions/image-link'
        }
      },
      altText: 'alt text'
    };
    const expectedImage = JSON.parse(JSON.stringify(imageContent));

    const result = await parseContent([imageContent]);

    expect(result).toEqual([expectedImage]);
  });

  test('should parse video when passed as content', async () => {
    const videoContent = {
      video: {
        defaultHost: 'i1.adis.ws',
        endpoint: 'blogltd',
        name: 'SampleVideo_1280x720_5mb',
        id: '721044de-d125-4a1a-8ddc-2201b9463f2d',
        _meta: {
          schema: 'http://bigcontent.io/cms/schema/v1/core#/definitions/video-link'
        }
      }
    };
    const expectedImage = JSON.parse(JSON.stringify(videoContent));
    expectedImage.srcSet = ['//i1.adis.ws/v/blogltd/casual-wear?protocol=https'];

    mockFetch.mockImplementationOnce(() => {
      return {
        status: 200,
        json() {
          return {
            media: [
              {
                src: '//i1.adis.ws/v/blogltd/casual-wear'
              }
            ]
          };
        }
      };
    });

    mockGetVideoSources.mockResolvedValue(['//i1.adis.ws/v/blogltd/casual-wear?protocol=https']);
    const result = await parseContent([videoContent]);

    expect(result).toEqual([expectedImage]);
    expect(mockGetVideoSources).toHaveBeenCalled();
  });

  test('should return an empty array when no content to parse', async () => {
    const result = await parseContent([]);

    expect(result).toEqual([]);
  });
});
