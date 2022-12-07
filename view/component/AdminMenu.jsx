import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class AdminMenu extends React.Component {
    componentDidMount() {
        $(document).ready(() => {
            PcodedMenu.PcodedMenuInit();
            setTimeout(() => {
                $('ul.pcoded-item > li.pcoded-hasmenu').on('click', function() {
                    $(this).closest('.pcoded-inner-navbar').find('li.pcoded-trigger').removeClass('pcoded-trigger');
                    $(this).addClass('active pcoded-trigger');
                });
            }, 100);
        });
    }

    render() {
        let { user = null } = this.props.system ? this.props.system : {};
        if (user == null) user = {};

        const menus = [];
        if (user.menu) {
            Object.keys(user.menu).sort().forEach((menuIndex) => {
                const userMenuItem = user.menu[menuIndex], parentMenu = userMenuItem.parentMenu;
                if (parentMenu) {
                    const submenuIndexes = userMenuItem.menus ? Object.keys(userMenuItem.menus).sort() : [];
                    if (parentMenu.subMenusRender && submenuIndexes.length) {
                        menus.push(
                            <li className='pcoded-hasmenu' key={menus.length} dropdown-icon='style1' subitem-icon='style1'>
                                <a href='#'>
                                    <span className='pcoded-micon'><i className={`feather icon-${parentMenu.icon}`}/></span>
                                    <span className='pcoded-mtext'>{parentMenu.title}</span>
                                </a>
                                <ul className='pcoded-submenu'>
                                    {submenuIndexes.map((menuIndex, key) => (
                                        <li key={key}>
                                            <Link to={userMenuItem.menus[menuIndex].link}>
                                                <span className='pcoded-mtext'>{userMenuItem.menus[menuIndex].title}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>);
                    } else {
                        menus.push(
                            <li key={menus.length}>
                                <Link to={parentMenu.link}>
                                    <span className='pcoded-micon'><i className={`feather icon-${parentMenu.icon}`}/></span>
                                    <span className='pcoded-mtext'>{parentMenu.title}</span>
                                </Link>
                            </li>
                        );
                    }
                }
            });
        }

        return (
            <nav className='pcoded-navbar'>
                <div className='pcoded-inner-navbar main-menu'>
                    <ul className='pcoded-item pcoded-left-item'>
                        {menus}
                    </ul>
                </div>
            </nav>
        );
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(AdminMenu);
