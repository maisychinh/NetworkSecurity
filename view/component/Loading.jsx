import React from 'react';

class Loading extends React.Component {
    componentDidMount() {
        $(document).ready(function () {
            $('.theme-loader').fadeOut('slow', function() {
                $(this).remove();
            });
        });
    }

    render() {
        return (
            <div className='theme-loader'>
                <div className='ball-scale'>
                    <div className='contain'>
                        <div className='ring'><div className='frame' /></div>
                        <div className='ring'><div className='frame' /></div>
                        <div className='ring'><div className='frame' /></div>
                        <div className='ring'><div className='frame' /></div>
                        <div className='ring'><div className='frame' /></div>
                        <div className='ring'><div className='frame' /></div>
                        <div className='ring'><div className='frame' /></div>
                        <div className='ring'><div className='frame' /></div>
                        <div className='ring'><div className='frame' /></div>
                        <div className='ring'><div className='frame' /></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Loading;