import React, { Component } from 'react';
import { Table } from 'antd';
import { observer, inject } from 'mobx-react';

import wanLogo from 'static/image/wan.png';

import './index.less';

@inject(stores => ({
  portfolioList: stores.portfolio.portfolioList,
  changeTitle: newTitle => stores.session.changeTitle(newTitle),
  updateCoinPrice: () => stores.portfolio.updateCoinPrice()
}))

@observer
class Portfolio extends Component {
  
  columns = [
    {
      title: '',
      title: 'NAME',
      dataIndex: 'name',
      key: 'name',
      render: text => <div><img className="nameIco" src={wanLogo} /><span>{text}</span></div>,
    }, {
      title: 'PRICE',
      dataIndex: 'price',
      key: 'price',
    }, {
      title: 'BALANCE',
      dataIndex: 'balance',
      key: 'balance',
    }, {
      title: 'VALUE',
      dataIndex: 'value',
      key: 'value'
    }, {
      title: 'PORTFOLIO',
      dataIndex: 'portfolio',
      key: 'portfolio',
    }
  ]

  componentWillMount() {
    this.props.changeTitle('Portfolio');
  }

  componentDidMount() {
    this.timer = setInterval(() =>{
      this.props.updateCoinPrice();
    }, 5000)
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return (
        <div>
            <Table className="portfolioMain" columns={this.columns} dataSource={this.props.portfolioList} pagination={false}/>
        </div>
    );
  }
}

export default Portfolio;