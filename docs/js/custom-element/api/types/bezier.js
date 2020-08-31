import { Vector } from "./vector.js";
import { Bezier as Original } from "../../lib/bezierjs/bezier.js";

/**
 * A canvas-aware Bezier curve class
 */
class Bezier extends Original {
  static defaultQuadratic(apiInstance) {
    if (!apiInstance) {
      throw new Error(
        `missing reference of API instance in Bezier.defaultQuadratic(instance)`
      );
    }
    return new Bezier(apiInstance, 70, 250, 20, 110, 220, 60);
  }

  static defaultCubic(apiInstance) {
    if (!apiInstance) {
      throw new Error(
        `missing reference of API instance in Bezier.defaultCubic(instance)`
      );
    }
    return new Bezier(apiInstance, 110, 150, 25, 190, 210, 250, 210, 30);
  }

  constructor(apiInstance, ...coords) {
    if (!apiInstance || !apiInstance.setMovable) {
      throw new Error(
        `missing reference of API instance in Bezier constructor`
      );
    }
    super(...coords);
    this.api = apiInstance;
    this.ctx = apiInstance.ctx;
  }

  project(x, y) {
    return super.project({ x, y });
  }

  getPointNear(x, y, d = 5) {
    const p = this.points;
    for (let i = 0, e = p.length; i < e; i++) {
      let dx = Math.abs(p[i].x - x);
      let dy = Math.abs(p[i].y - y);
      if ((dx * dx + dy * dy) ** 0.5 <= d) {
        return p[i];
      }
    }
  }

  drawCurve(color = `#333`) {
    const ctx = this.ctx;
    ctx.cacheStyle();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.beginPath();
    const lut = this.getLUT().slice();
    let p = lut.shift();
    ctx.moveTo(p.x, p.y);
    while (lut.length) {
      p = lut.shift();
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restoreStyle();
  }

  drawPoints(labels = true) {
    const colors = [`red`, `green`, `blue`, `yellow`];
    const api = this.api;
    const ctx = this.ctx;

    ctx.cacheStyle();
    ctx.lineWidth = 2;
    ctx.strokeStyle = `#999`;
    this.points.forEach((p, i) => {
      api.setFill(colors[i % colors.length]);
      api.circle(p.x, p.y, 5);
      if (labels) {
        api.setFill(`black`);
        let x = p.x | 0;
        let y = p.y | 0;
        api.text(`(${x},${y})`, x + 10, y + 10);
      }
    });
    ctx.restoreStyle();
  }

  drawSkeleton(color = `#555`) {
    const api = this.api;
    const ctx = this.ctx;
    ctx.cacheStyle();
    const p = this.points;
    api.noFill();
    api.setStroke(color);
    api.start();
    p.forEach((v) => api.vertex(v.x, v.y));
    api.end();
    ctx.restoreStyle();
  }

  getStrutPoints(t) {
    const p = this.points.map((p) => new Vector(p));
    const mt = 1 - t;

    let s = 0;
    let n = p.length + 1;
    while (--n > 1) {
      let list = p.slice(s, s + n);
      for (let i = 0, e = list.length - 1; i < e; i++) {
        let pt = list[i + 1].subtract(list[i + 1].subtract(list[i]).scale(mt));
        p.push(pt);
      }
      s += n;
    }

    return p;
  }

  drawStruts(t, color = `black`) {
    const p = t.forEach ? t : this.getStrutPoints(t);

    const api = this.api;
    const ctx = api.ctx;
    ctx.cacheStyle();
    api.noFill();
    api.setStroke(color);

    let s = this.points.length;
    let n = this.points.length;
    while (--n > 1) {
      api.start();
      for (let i = 0; i < n; i++) {
        let pt = p[s + i];
        api.vertex(pt.x, pt.y);
        api.circle(pt.x, pt.y, 5);
      }
      api.end();
      s += n;
    }
    ctx.restoreStyle();

    return p;
  }

  drawBoundingBox(color) {
    let bbox = this.bbox(),
      mx = bbox.x.min,
      my = bbox.y.min,
      MX = bbox.x.max,
      MY = bbox.y.max,
      api = this.api;
    api.cacheStyle();
    api.noFill();
    api.setStroke(color ? color : `black`);
    api.rect(mx, my, MX - mx, MY - my);
    api.restoreStyle();
  }
}

export { Bezier };
