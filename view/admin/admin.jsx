import T from '../js/common'; window.T = T;

import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// import { getSystemState, updateSystemState } from 'modules/_default/_init/redux';
import { getSystemState, logout } from 'modules/_default/_init/redux';
// import { changeUser } from 'modules/_default/fwUser/redux';

// import Loadable from 'react-loadable';
// import Loading from 'view/component/Loading';
import AdminHeader from '../component/AdminHeader';
import AdminMenu from '../component/AdminMenu';

// Load modules -------------------------------------------------------------------------------------------------------------------------------------
import { modules } from './modules.jsx';
const reducers = {}, reducerContainer = {}, routeMapper = {},
    addRoute = route => routeMapper[route.path] = <Route key={route.path} exact {...route} />;
modules.forEach(module => {
    module.init && module.init();
    module.routes.forEach(route => addRoute(route));

    if (module.redux.parent && module.redux.reducers) {
        if (!reducerContainer[module.redux.parent]) reducerContainer[module.redux.parent] = {};
        reducerContainer[module.redux.parent] = Object.assign({}, reducerContainer[module.redux.parent], module.redux.reducers);
    } else {
        Object.keys(module.redux).forEach(key => reducers[key] = module.redux[key]);
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
        // this.setState({ routes });
        this.props.getSystemState(() => this.setState({ routes }));

        // this.props.getSystemState(() => {
        //     T.socket.emit('system:join');
        //     this.setState({ routes });
        // });

        // T.socket.on('user-changed', user => {
        //     if (this.props.system && this.props.system.user && this.props.system.user._id == user._id) {
        //         store.dispatch(updateSystemState({ user: Object.assign({}, this.props.system.user, user) }));
        //     }
        //     store.dispatch(changeUser(user));
        // });

        // T.socket.on('debug-user-changed', user => store.dispatch(updateSystemState({ user })));
        // T.socket.on('debug-role-changed', roles => this.props.system && this.props.system.isDebug && this.props.updateSystemState({ roles }));
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
                                <AdminMenu />
                                <div className='pcoded-content'>
                                    <Switch>
                                        {this.state.routes}
                                        {/* <Route path='**' component={Loadable({ loading: Loading, loader: () => import('view/component/MessagePage') })} /> */}
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

const Main = connect(state => ({ system: state.system }), { getSystemState, logout })(App);
ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('pcoded'));
