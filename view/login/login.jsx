import T from '../js/common';
import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { register, login, forgotPassword, logout } from 'modules/_default/_init/redux';

// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import { modules } from './modules';

const reducers = {}, reducerContainer = {}, routeMapper = {},
    addRoute = route => {
        if (!route.path.startsWith('/user')) routeMapper[route.path] = <Route key={route.path} {...route} exact />;
    };
modules.forEach(module => {
    module.routes.forEach(addRoute);
    if (module.redux) {
        if (module.redux.parent && module.redux.reducers) {
            if (!reducerContainer[module.redux.parent]) reducerContainer[module.redux.parent] = {};
            reducerContainer[module.redux.parent] = Object.assign({}, reducerContainer[module.redux.parent], module.redux.reducers);
        } else {
            Object.keys(module.redux).forEach(key => reducers[key] = module.redux[key]);
        }
    }
});
Object.keys(reducerContainer).forEach(key => reducers[key] = combineReducers(reducerContainer[key]));
const store = createStore(combineReducers(reducers), {}, composeWithDevTools(applyMiddleware(thunk)));
T.template = 'login';
window.T = T;

// Main DOM render ----------------------------------------------------------------------------------------------------------------------------------
class App extends React.Component {
    state = { routes: [], loading: true };
    componentDidMount() {
        const routes = Object.keys(routeMapper).sort().reverse().map(key => routeMapper[key]);
        this.setState({ routes });
    }

    render() {
        return (
            <BrowserRouter>
                <React.Fragment>
                    <Switch>
                        {this.state.routes}
                    </Switch>
                </React.Fragment>
            </BrowserRouter>
        );
    }
}

const Main = connect(state => ({ system: state.system }), { register, login, forgotPassword, logout })(App);
ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('pcoded'));