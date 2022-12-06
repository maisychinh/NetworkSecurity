import T from '../js/common'; window.T = T;

import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import AdminHeader from '../component/AdminHeader';
import { logout } from 'modules/_default/_init/redux';
// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import { modules } from './modules.jsx';
const reducers = {}, reducerContainer = {}, routeMapper = {},
    addRoute = route => routeMapper[route.path] = <Route key={route.path} exact {...route} />;
modules.forEach(module => {
    module.init && module.init();
    module.routes.forEach(route => addRoute(route));
    if (module && module.redux) {
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

T.template = 'admin';
window.T = T;

// Main DOM render ----------------------------------------------------------------------------------------------------------------------------------
class App extends React.Component {
    state = { routes: [] };
    componentDidMount() {
        const routes = Object.keys(routeMapper).sort().reverse().map(key => routeMapper[key]);
        this.setState({ routes });
    }

    render() {
        return (
            <BrowserRouter>
                <React.Fragment>
                    <div className='pcoded-overlay-box' />
                    <div className='pcoded-container navbar-wrapper'>
                        <AdminHeader logout={this.props.logout} />
                        <div className='pcoded-main-container'>
                            <div className='pcoded-wrapper'>
                                {/* <AdminMenu /> */}
                                <div className='pcoded-content'>
                                    <Switch>
                                        {this.state.routes}
                                    </Switch>
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </BrowserRouter>
        );
    }
}

const Main = connect(state => ({ system: state.system }), { logout })(App);
ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('pcoded'));
