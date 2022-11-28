//TEMPLATES: admin|login
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import system from './redux';

export default {
    redux: { system },
    routes: [
        {
            path: '/user/dashboard',
            component: Loadable({ loading: Loading, loader: () => import('./adminDashboardPage') })
        },
    ]
};