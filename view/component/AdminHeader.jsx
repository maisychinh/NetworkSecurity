import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class AdminHeader extends React.Component {
    state = { showContact: false };

    componentDidMount() {
        $(document).ready(() => {
            // Collapse
            $('#mobile-collapse i').addClass('icon-toggle-right');
            $('#mobile-collapse').on('click', function () {
                $('#mobile-collapse i').toggleClass('icon-toggle-right');
                $('#mobile-collapse i').toggleClass('icon-toggle-left');
            });

            // Search
            $('.search-btn').on('click', function () {
                $('.main-search').addClass('open');
                $('.main-search .form-control').animate({
                    'width': '200px'
                });
            });
            $('.search-close').on('click', function () {
                $('.main-search .form-control').animate({
                    'width': '0'
                });
                setTimeout(function () {
                    $('.main-search').removeClass('open');
                }, 300);
            });
        });
    }

    toggleFullScreen = () => {
        // let a = $(window).height() - 10;
        if (!document.fullscreenElement && // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement) { // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
        $('.full-screen').toggleClass('icon-maximize');
        $('.full-screen').toggleClass('icon-minimize');
    }

    // componentDidMount() {
    //     const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
    //     const showContact = currentPermissions.contains('contact:read');
    //     if (showContact) this.props.getUnreadContacts((_, error) => error && this.setState({ showContact: true }));
    //
    //     T.showSearchBox = (onSearchHide = null) => {
    //         this.searchBox && $(this.searchBox).parent().css('display', 'flex');
    //         this.advancedSearch && $(this.advancedSearch).css('display', onSearchHide ? 'flex' : 'none');
    //         if (onSearchHide && typeof onSearchHide == 'function') {
    //             T.onAdvanceSearchHide = onSearchHide;
    //         } else {
    //             T.onAdvanceSearchHide = null;
    //         }
    //     };
    //     T.setTextSearchBox = (searchText) => {
    //         if (typeof searchText == 'object') searchText = '';
    //         this.searchBox && $(this.searchBox).val(searchText) && $(this.searchBox).trigger('change');
    //     };
    //     T.hideSearchBox = () => {
    //         this.searchBox && $(this.searchBox).parent().css('display', 'none');
    //         this.advancedSearch && $(this.advancedSearch).css('display', 'none');
    //     };
    //     T.clearSearchBox = () => {
    //         if (this.searchBox) this.searchBox.value = '';
    //     };
    // }

    showContact = (e, contactId) => e.preventDefault() || this.props.getContact(contactId, contact => this.contactModal.show(contact));

    logout = (e) => e.preventDefault() || this.props.logout();


    search = (e) => e.preventDefault() || T.onSearch && T.onSearch(this.searchBox.value);

    onAdvanceSearch = (e) => {
        e.preventDefault();
        if ($('.app-advance-search')) {
            // Close advance search
            if ($('.app-advance-search').hasClass('show')) {
                T.onAdvanceSearchHide && T.onAdvanceSearchHide();
            }

            $('.app-advance-search').toggleClass('show');
        }
    }

    debugAsRole = (e, role) => e.preventDefault() || this.props.changeRole(role, user => this.props.updateSystemState({ user }));

    showDebugModal = e => e.preventDefault() || this.debugModal.show();

    renderContact = () => {
        let list = this.props.contact && this.props.contact.unreads && this.props.contact.unreads.length > 0 ?
            this.props.contact.unreads.map((item, index) => (
                <li key={index}>
                    <a className='app-notification__item' href='#' onClick={e => this.showContact(e, item._id)}>
                        <span className='app-notification__icon'>
                            <span className='fa-stack fa-lg'>
                                <i className='fa fa-circle fa-stack-2x text-primary' />
                                <i className='fa fa-envelope fa-stack-1x fa-inverse' />
                            </span>
                        </span>
                        <div>
                            <p className='app-notification__message' style={{ fontWeight: 'bold' }}>{item.subject}</p>
                            <p className='app-notification__meta'>{new Date(item.createdDate).getText()}</p>
                        </div>
                    </a>
                </li>)) : '';
        let notificationTitle = list.length > 0 ? 'Bạn có ' + list.length + ' liên hệ mới' : 'Bạn không có liên hệ mới';
        return (
            <li className='dropdown'>
                <a className='app-nav__item' href='#' data-toggle='dropdown' aria-label='Show notifications'>
                    <i className='fa fa-bell-o fa-lg' />
                </a>
                <ul className='app-notification dropdown-menu dropdown-menu-right'>
                    <li className='app-notification__title'>{notificationTitle}</li>
                    <div className='app-notification__content'>
                        {list}
                    </div>
                    <li className='app-notification__footer'>
                        <Link to='/user/contact'>Đến trang Liên hệ</Link>
                    </li>
                </ul>
            </li>
        );
    }

    render() {
        // const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        // const isDebug = this.props.system && this.props.system.isDebug,
        //     isAdmin = this.props.system && this.props.system.user && this.props.system.user.roles.some(role => role.name == 'admin');
        let { user = null } = this.props.system ? this.props.system : {};
        if (user == null) user = { firstname: 'firstname', lastname: 'lastname', role: '', isStaff: false, isStudent: false };
        if (user.image == null) user.image = '/img/avatar.png';

        return (
            <nav className='navbar header-navbar pcoded-header'>
                <div className='navbar-wrapper'>
                    <div className='navbar-logo'>
                        {/* <a className='mobile-menu' id='mobile-collapse' href='#'>
                            <i className='feather icon-menu' />
                        </a> */}
                        <Link className='app-header__logo' to='/user'>BK Identity and Access Management</Link>
                        <a className='mobile-options'>
                            <i className='feather icon-more-horizontal' />
                        </a>
                    </div>

                    <div className='navbar-container container-fluid'>
                        <ul className='nav-left'>
                            <li className='header-search'>
                                <div className='main-search morphsearch-search'>
                                    <div className='input-group'>
                                        <span className='input-group-addon search-close'><i className='feather icon-x' /></span>
                                        <input type='text' className='form-control' />
                                        <span className='input-group-addon search-btn'><i className='feather icon-search' /></span>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <a href='#' onClick={e => e.preventDefault() || this.toggleFullScreen()}>
                                    <i className='feather icon-maximize full-screen' />
                                </a>
                            </li>
                            <li>
                                <a href='#' onClick={this.logout} >
                                    <i className='feather icon-log-out' /> Logout
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(AdminHeader);