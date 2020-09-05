import { h, init } from "snabbdom";
import moduleClass from "snabbdom/modules/class";
import moduleStyle from "snabbdom/modules/style";
import moduleProps from "snabbdom/modules/props";
import moduleEventLisenters from "snabbdom/modules/eventlisteners";

import originalData from "./data";

// 传入模块创建 patch 函数
const patch = init([
  moduleClass,
  moduleStyle,
  moduleProps,
  moduleEventLisenters,
]);

let data = [
  originalData[0],
  originalData[1],
  originalData[2],
  originalData[3],
  originalData[4],
  originalData[5],
  originalData[6],
  originalData[7],
  originalData[8],
  originalData[9],
];

let vnode = null;
let nextKey = 11;
let margin = 8;
let sortBy = "rank";
let totalHeight = 0;

const render = () => {
  data = data.reduce((acc, m) => {
    var last = acc[acc.length - 1];
    m.offset = last ? last.offset + last.elmHeight + margin : margin;
    return acc.concat(m);
  }, []);
  totalHeight = data[data.length - 1].offset + data[data.length - 1].elmHeight;
  vnode = patch(vnode, view(data));
};

const changeSort = (prop) => {
  sortBy = prop;
  data.sort((a, b) => a[prop] - b[prop]);
  render();
};

const add = () => {
  const item = originalData[Math.floor(Math.random() * 10)];
  const newData = {
    rank: nextKey++,
    title: item.title,
    desc: item.desc,
    elmHeight: 0,
  };
  data.push(newData);
  render();
};

const remove = (movie) => {
  data = data.reduce((acc, m) => {
    let last = acc[acc.length - 1];
    m.offset = last ? last.offset + last.elmHeight + margin : margin;
    return acc.concat(m);
  }, []);

  const lastData = data[data.length - 1];
  totalHeight = lastData.offset + lastData.elmHeight;
  vnode = patch(vnode, view(data));
};

const movieView = (movie) => {
  return h(
    "div.row",
    {
      key: movie.rank,
      style: {
        opacity: "0",
        transform: "translate(-200px)",
        delayed: { transform: `translateY(${movie.offset}px)`, opacity: "1" },
        remove: {
          opacity: "0",
          transform: `translateY(${movie.offset}px) translateX(200px)`,
        },
      },
      hook: {
        insert: (vnode) => {
          movie.elmHeight = vnode.elm.offsetHeight;
        },
      },
    },
    [
      h("div", { style: { fontWeight: "bold" } }, movie.rank),
      h("div", movie.title),
      h("div", movie.desc),
      h("div.btn.rm-btn", { on: { click: [remove, movie] } }, "x"),
    ]
  );
};

const view = (data) => {
  return h("div", [
    h("h1", "Top 10 movies"),
    h("div", [
      h("a.btn.add", { on: { click: add } }, "Add"),
      "Sort by: ",
      h("span.btn-group", [
        h(
          "a.btn.rank",
          {
            class: { active: sortBy === "rank" },
            on: { click: [changeSort, "rank"] },
          },
          "Rank"
        ),
        h(
          "a.btn.title",
          {
            class: { active: sortBy === "title" },
            on: { click: [changeSort, "title"] },
          },
          "Title"
        ),
        h(
          "a.btn.desc",
          {
            class: { active: sortBy === "desc" },
            on: { click: [changeSort, "desc"] },
          },
          "Description"
        ),
      ]),
    ]),
    h(
      "div.list",
      { style: { height: totalHeight + "px" } },
      data.map(movieView)
    ),
  ]);
};

// DOM渲染完执行首轮渲染
window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  vnode = patch(container, view(data));
  render();
});
