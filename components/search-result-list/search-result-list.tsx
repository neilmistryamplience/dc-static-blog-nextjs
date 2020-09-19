import React, { FunctionComponent } from 'react';
import { StateResultsProvided } from 'react-instantsearch-core';
import { connectStateResults } from 'react-instantsearch-dom';
import BlogPost from '../../common/interfaces/blog-post.interface';
import { isBlogPost } from '../../common/services/blog-post.service';
import BlogList from '../blog-list/blog-list';
import LoadingBlogPosts from '../blog-list/loading-blog-posts';
import NoBlogPosts from '../blog-list/no-blog-posts';
import NoResults from '../blog-list/no-results';
import SortByDropdown from './sort-by-dropdown';

const BlogPostSearchResultList: FunctionComponent<StateResultsProvided<BlogPost>> = ({ searchResults }) => {
  if (!searchResults) {
    return <LoadingBlogPosts />;
  }

  if (searchResults.query.length > 0 && searchResults.hits.length === 0) {
    return <NoResults query={searchResults.query} />;
  }

  if (searchResults.hits.length === 0) {
    return <NoBlogPosts />;
  }
  
  const blogPosts = searchResults.hits.filter(isBlogPost);
  console.log(blogPosts)

  return (
    <div id="searchResults">
      <SortByDropdown />
      <BlogList blogPosts={blogPosts} />
    </div>
  );
};

const SearchResultList = connectStateResults(BlogPostSearchResultList);
export default SearchResultList;
