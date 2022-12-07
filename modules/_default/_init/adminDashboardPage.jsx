import React from 'react';
import { AdminPage } from 'view/component/AdminPage';

export default class DashboardPage extends AdminPage {
    componentDidMount() {
        T.ready();
    }

    render() {
        return this.renderPage({
            title: 'Dashboard',
            subTitle: 'Test dashboard',
            breadcrumb: ['text 1', 'text 2'],
            content: <>
                <div className='card'>
                    <div className='card-header'>
                        <h5>Hello</h5>
                        <span>Description</span>
                    </div>
                    <div className='card-block'>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                            enim ad minim veniam, quis nostrud exercitation ullamco laboris
                            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                            in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                            nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                            sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    </div>
                    <div className='card-footer'>
                        <h6 className='text-muted m-b-30 m-t-15'>Total completed project and earning</h6>
                        <div className='row text-center'>
                            <div className='col-6 b-r-default'>
                                <h6 className='text-muted m-b-10'>Completed Projects</h6>
                                <h4 className='m-b-0 f-w-600 '>175</h4>
                            </div>
                            <div className='col-6'>
                                <h6 className='text-muted m-b-10'>Total Earnings</h6>
                                <h4 className='m-b-0 f-w-600 '>76.6M</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        });
    }
}