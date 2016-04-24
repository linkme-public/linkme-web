import React, { Component, PropTypes } from 'react';

/**
 * Connects your Queries to your React Component properties.
 * In the example below, a ConversationList is passed in,
 * and a ConversationListContainer that contains a child of ConversationList
 * and which provides ConversationList with properties provided
 * by the queries.
 *
      function getInitialQueryParams (props) {
        return {
          paginationWindow: props.startingPaginationWindow || 100
        };
      }

      function getQueries(props, queryParams) {
        return {
          conversations: QueryBuilder.conversations().paginationWindow(queryParams.paginationWindow)
        };
      }

      var ConversationListContainer = connectQuery(getInitialQueryParams, getQueries)(ConversationList);
 *
 * @method connectQuery
 * @param  {Object|Function} getInitialQueryParams   Initial properties for all queries
 * @param  {Function} getQueries          A function that returns a hash of QueryBuilders
 * @param {Object} getQueries.props       All properties passed in from the parent of this component
 * @param {Object} getQueries.queryParams Initial property values as specified by getInitialQueryParams
 * @param {Object} getQueries.return      A hash of Query instances
 * @return {Function}                     Call this function to create a wrapped component which can be
 *                                        be rendered and which passes query data to your component.
 */
export default function connectQuery(getInitialQueryParams = {}, getQueries) {
  /**
   * Takes a Component, and wraps it with a QueryContainer (makes the
   * input Component a child Component of the QueryContainer) and
   * passes in Query data to the wrapped Component in the form of properties.
   * Note that the property names will match the keys returned by getQueries().
   *
   * @method
   * @param  {Component} ComposedComponent   The Component to wrap
   * @return {QueryContainer}                A Component that wraps the specified Component
   */
  return (ComposedComponent) => {
    /**
     * A Component which manages a set of Queries and passes the output
     * of those queries into its child component.
     *
     * @class QueryContainer
     * @extends {react.Component}
     */
    return class QueryContainer extends Component {
      static propTypes = {
        client: PropTypes.object,
      }

      // Necessary in order to grab client out of the context.
      // TODO: May want to rename to layerClient to avoid conflicts.
      static contextTypes = {
        client: PropTypes.object,
      }

      /**
       * Call getQueries to get our QueryBuilder instances, and populate
       * state with the Query Parameters and Query Results (initially results
       * are all [])
       *
       * @method constructor
       */
      constructor(props, context) {
        super(props, context);

        this.client = props.client || context.client;
        this.queries = {};

        const queryParams = (typeof getInitialQueryParams === 'function')
          ? getInitialQueryParams(props)
          : getInitialQueryParams;

        const queryBuilders = getQueries(props, queryParams);

        // Set initial queryResults to empty arrays.
        const queryResults = Object.keys(queryBuilders).reduce((obj, key) => ({
          ...obj,
          [key]: [],
        }), {});

        this.state = {
          queryResults,
          queryParams,
        };
      }

      /**
       * On mounting (and once the client is ready) call _updateQueries
       */
      componentWillMount() {
        this.client.on('ready', this._onClientReady);

        if (this.client.isReady) {
          this._updateQueries(this.props, this.state.queryParams);
        }
      }

      _onClientReady = () => {
        this._updateQueries(this.props, this.state.queryParams);
      }

      setQueryParams = (nextQueryParams, callback) => {
        this._updateQueries(this.props, nextQueryParams, callback);
      }

      componentWillReceiveProps(nextProps) {
        this._updateQueries(nextProps, this.state.queryParams);
      }

      /**
       * Generate the this.queries object to contain
       * layer.Query instances based on the getQueries()
       * QueryBuilders.  If the query already exists, update
       * it rather than replace it.
       *
       * @method _updateQueries
       * @private
       * @param  {Object}   props       Component properties
       * @param  {Object}   queryParams Query properties
       * @param  {Function} callback
       */
      _updateQueries = (props, queryParams, callback) => {
        const queryBuilders = getQueries(props, queryParams);

        // Remove any queries that no longer exist
        Object.keys(this.queries).forEach((key) => {
          if (!queryBuilders[key]) {
            const query = this.queries[key];
            query.off('change', this._onQueryChange, this);

            delete this.queries[key];
          }
        });

        // Update existing queries / Create new queries
        Object.keys(queryBuilders).forEach((key) => {
          const query = this.queries[key];
          const builder = queryBuilders[key];

          if (query) {
            query.update(builder.build());
          } else {
            const newQuery = this.client.createQuery(builder);

            this.queries[key] = newQuery;

            newQuery.on('change', () => {
              this._onQueryChange(key, newQuery.data);
            });
          }
        });

        this.setState({
          queryParams,
        }, callback);
      }

      /**
       * Any time the Query's data changes,
       * update this.state.queryResults[queryName]
       * with the new results.  Setting state will cause
       * the render method to pass the updated query data
       * to its ComposedComponent.
       *
       * @method _onQueryChange
       * @param  {string} queryName    - Name of the query (name comes from keys returned by getQueries())
       * @param  {Object[]} newResults - Array of query results
       */
      _onQueryChange = (queryName, newResults) => {
        this.setState({
          queryResults: {
            ...this.state.queryResults,
            [queryName]: newResults,
          },
        });
      }

      /**
       * Pass any properties provided to the QueryContainer
       * to its child container, along with the query results,
       * query parameters, and a setQueryParams function.
       *
       * @method render
       */
      render() {
        const { queryParams, queryResults } = this.state;

        const passedProps = {
          ...queryResults,
          query: {
            queryParams,
            setQueryParams: this.setQueryParams,
          },
        };

        return <ComposedComponent {...this.props} {...passedProps} />;
      }

      componentWillUnmount() {
        // When the component unmounts, unsubscribe from all event listeners.
        Object.keys(this.queries).forEach((key) => {
          const query = this.queries[key];
          query.off('change', this._onQueryChange, this);
          this.client.off('ready', this._onClientReady, this);
        });
      }
    };
  };
}
