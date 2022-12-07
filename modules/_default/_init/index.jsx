//TEMPLATES: admin|login
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import system from './redux';

export default {
    redux: { system },
    routes: [
        {
            path: '/pin-authen',
            component: Loadable({ loading: Loading, loader: () => import('../../../view/component/PinAuthen') })
        },
        // {
        //     path: '/',
        //     component: Loadable({ loading: Loading, loader: () => import('../../../view/component/Login') })
        // },
    ]
};