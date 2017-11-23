import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import './App.css';

class App extends Component {
  renderLoading() {
    return (
      <div>Loading...</div>
    );
  }
  renderCategories() {
    return this.props.data.Category.map(category => {
      return (
        <div key={category.categoryID}>
          {category.categoryName}
        </div>
      );
    });
  }
  render() {
    return (
      <div>
        { this.props.data.loading && 
          this.renderLoading()
        }
        { this.props.data.Category &&
          this.renderCategories()
        }
      </div>
    );
  }
}

const QUERY = gql`
{
  Category{
    categoryName
    categoryID
  }
}
`;

export default graphql(QUERY)(App);
