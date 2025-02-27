/*
 * @Autor: huasenjio
 * @Date: 2021-08-25 01:53:35
 * @LastEditors: huasenjio
 * @LastEditTime: 2023-03-19 16:36:44
 * @Description:
 */

import Vue from 'vue';
const that = Vue.prototype;

export default {
  // 解析本地缓存的用户配置，若不存在，则采用仓库默认设定值
  initLocalUserInfo(context, payload) {
    try {
      // 获取本地存储数据
      let user = that.STORAGE.getItem(that.CONSTANT.localUser);
      // 本地存储有用户数据
      if (user) {
        let config = { ...context.state.user.config, ...JSON.parse(user.config) };
        let records = JSON.parse(user.records);
        // 提交更新
        context.commit('commitAll', {
          user: {
            id: user.id,
            name: user.name,
            headImg: user.headImg,
            code: user.code,
            token: user.token,
            records,
            config,
          },
        });
      }
    } catch (err) {
      that.$tips('error', '初始化失败', 'top-right', 2000, () => {
        that.STORAGE.clear();
      });
    }
  },

  // 初始化主题皮肤
  initLocalStyleInfo(context, payload) {
    // 解析状态
    let localStyle = context.state.user.config.theme;
    // 遍历id修改样式
    Object.keys(localStyle).map(id => {
      let node = document.getElementById(id);
      if (node) {
        node.classList.add('inherit-theme');
        node.style.color = localStyle[id].color;
        node.style.backgroundColor = localStyle[id].backgroundColor;
      }
    });
  },

  // 初始化配置
  async initAppConfigInfo(context, payload) {
    let res = await that.API.findAppConfig({}, { notify: false });
    try {
      context.commit('commitAll', {
        appConfig: {
          article: that.LODASH.get(res.data, 'article'),
          site: {
            name: that.LODASH.get(res.data, 'site.name') || '花森',
            logoURL: that.LODASH.get(res.data, 'site.logoURL') || require('@/assets/img/logo/favicon.svg'),
            redirectURL: that.LODASH.get(res.data, 'site.redirectURL') || 'http://huasen.cc/',
            home: {
              title: that.LODASH.get(res.data, 'site.home.title') || '花森小窝',
              url: that.LODASH.get(res.data, 'site.home.url') || 'http://huasen.cc/',
            },
            footer: {
              text: that.LODASH.get(res.data, 'site.footer.text') || '',
              url: that.LODASH.get(res.data, 'site.footer.url') || '',
            },
          },
        },
        themeConfig: that.LODASH.get(res.data, 'theme'),
      });
      console.log('初始化配置成功');
    } catch (err) {
      that.$tips('error', '初始化配置出错', 'top-right', 2000);
    }
  },

  // 保存当前用户快照
  snapshoot(context, payload) {
    let { user } = context.state;

    // 过滤无用的theme配置
    Object.keys(user.config.theme).map(key => {
      let node = document.getElementById(key);
      if (!node) {
        delete user.config.theme[key];
      }
    });

    that.STORAGE.setItem(that.CONSTANT.localUser, {
      id: user.id,
      name: user.name,
      code: user.code,
      headImg: user.headImg,
      token: user.token,

      records: JSON.stringify(user.records),
      config: JSON.stringify(user.config),
    });
  },
};
