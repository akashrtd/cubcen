"use strict";
var _bt_e, _b, _wt_e, _c, _Et_e, _d;
var Xo = Object.create;
var It = Object.defineProperty;
var Zo = Object.getOwnPropertyDescriptor;
var es = Object.getOwnPropertyNames;
var ts = Object.getPrototypeOf, rs = Object.prototype.hasOwnProperty;
var ie = (t, e) => () => (t && (e = t(t = 0)), e);
var Fe = (t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports), it = (t, e) => { for (var r in e)
    It(t, r, { get: e[r], enumerable: !0 }); }, pn = (t, e, r, n) => { if (e && typeof e == "object" || typeof e == "function")
    for (let i of es(e))
        !rs.call(t, i) && i !== r && It(t, i, { get: () => e[i], enumerable: !(n = Zo(e, i)) || n.enumerable }); return t; };
var ot = (t, e, r) => (r = t != null ? Xo(ts(t)) : {}, pn(e || !t || !t.__esModule ? It(r, "default", { value: t, enumerable: !0 }) : r, t)), ns = t => pn(It({}, "__esModule", { value: !0 }), t);
function Pr(t, e) { if (e = e.toLowerCase(), e === "utf8" || e === "utf-8")
    return new h(as.encode(t)); if (e === "base64" || e === "base64url")
    return t = t.replace(/-/g, "+").replace(/_/g, "/"), t = t.replace(/[^A-Za-z0-9+/]/g, ""), new h([...atob(t)].map(r => r.charCodeAt(0))); if (e === "binary" || e === "ascii" || e === "latin1" || e === "latin-1")
    return new h([...t].map(r => r.charCodeAt(0))); if (e === "ucs2" || e === "ucs-2" || e === "utf16le" || e === "utf-16le") {
    let r = new h(t.length * 2), n = new DataView(r.buffer);
    for (let i = 0; i < t.length; i++)
        n.setUint16(i * 2, t.charCodeAt(i), !0);
    return r;
} if (e === "hex") {
    let r = new h(t.length / 2);
    for (let n = 0, i = 0; i < t.length; i += 2, n++)
        r[n] = parseInt(t.slice(i, i + 2), 16);
    return r;
} fn(`encoding "${e}"`); }
function is(t) { let r = Object.getOwnPropertyNames(DataView.prototype).filter(a => a.startsWith("get") || a.startsWith("set")), n = r.map(a => a.replace("get", "read").replace("set", "write")), i = (a, f) => function (y = 0) { return $(y, "offset"), X(y, "offset"), j(y, "offset", this.length - 1), new DataView(this.buffer)[r[a]](y, f); }, o = (a, f) => function (y, C = 0) { let R = r[a].match(/set(\w+\d+)/)[1].toLowerCase(), O = ss[R]; return $(C, "offset"), X(C, "offset"), j(C, "offset", this.length - 1), os(y, "value", O[0], O[1]), new DataView(this.buffer)[r[a]](C, y, f), C + parseInt(r[a].match(/\d+/)[0]) / 8; }, s = a => { a.forEach(f => { f.includes("Uint") && (t[f.replace("Uint", "UInt")] = t[f]), f.includes("Float64") && (t[f.replace("Float64", "Double")] = t[f]), f.includes("Float32") && (t[f.replace("Float32", "Float")] = t[f]); }); }; n.forEach((a, f) => { a.startsWith("read") && (t[a] = i(f, !1), t[a + "LE"] = i(f, !0), t[a + "BE"] = i(f, !1)), a.startsWith("write") && (t[a] = o(f, !1), t[a + "LE"] = o(f, !0), t[a + "BE"] = o(f, !1)), s([a, a + "LE", a + "BE"]); }); }
function fn(t) { throw new Error(`Buffer polyfill does not implement "${t}"`); }
function Mt(t, e) { if (!(t instanceof Uint8Array))
    throw new TypeError(`The "${e}" argument must be an instance of Buffer or Uint8Array`); }
function j(t, e, r = cs + 1) { if (t < 0 || t > r) {
    let n = new RangeError(`The value of "${e}" is out of range. It must be >= 0 && <= ${r}. Received ${t}`);
    throw n.code = "ERR_OUT_OF_RANGE", n;
} }
function $(t, e) { if (typeof t != "number") {
    let r = new TypeError(`The "${e}" argument must be of type number. Received type ${typeof t}.`);
    throw r.code = "ERR_INVALID_ARG_TYPE", r;
} }
function X(t, e) { if (!Number.isInteger(t) || Number.isNaN(t)) {
    let r = new RangeError(`The value of "${e}" is out of range. It must be an integer. Received ${t}`);
    throw r.code = "ERR_OUT_OF_RANGE", r;
} }
function os(t, e, r, n) { if (t < r || t > n) {
    let i = new RangeError(`The value of "${e}" is out of range. It must be >= ${r} and <= ${n}. Received ${t}`);
    throw i.code = "ERR_OUT_OF_RANGE", i;
} }
function dn(t, e) { if (typeof t != "string") {
    let r = new TypeError(`The "${e}" argument must be of type string. Received type ${typeof t}`);
    throw r.code = "ERR_INVALID_ARG_TYPE", r;
} }
function ms(t, e = "utf8") { return h.from(t, e); }
var h, ss, as, ls, us, cs, b, vr, u = ie(() => {
    "use strict";
    h = class t extends Uint8Array {
        constructor() {
            super(...arguments);
            this._isBuffer = !0;
        }
        get offset() { return this.byteOffset; }
        static alloc(e, r = 0, n = "utf8") { return dn(n, "encoding"), t.allocUnsafe(e).fill(r, n); }
        static allocUnsafe(e) { return t.from(e); }
        static allocUnsafeSlow(e) { return t.from(e); }
        static isBuffer(e) { return e && !!e._isBuffer; }
        static byteLength(e, r = "utf8") { if (typeof e == "string")
            return Pr(e, r).byteLength; if (e && e.byteLength)
            return e.byteLength; let n = new TypeError('The "string" argument must be of type string or an instance of Buffer or ArrayBuffer.'); throw n.code = "ERR_INVALID_ARG_TYPE", n; }
        static isEncoding(e) { return us.includes(e); }
        static compare(e, r) { Mt(e, "buff1"), Mt(r, "buff2"); for (let n = 0; n < e.length; n++) {
            if (e[n] < r[n])
                return -1;
            if (e[n] > r[n])
                return 1;
        } return e.length === r.length ? 0 : e.length > r.length ? 1 : -1; }
        static from(e, r = "utf8") { if (e && typeof e == "object" && e.type === "Buffer")
            return new t(e.data); if (typeof e == "number")
            return new t(new Uint8Array(e)); if (typeof e == "string")
            return Pr(e, r); if (ArrayBuffer.isView(e)) {
            let { byteOffset: n, byteLength: i, buffer: o } = e;
            return "map" in e && typeof e.map == "function" ? new t(e.map(s => s % 256), n, i) : new t(o, n, i);
        } if (e && typeof e == "object" && ("length" in e || "byteLength" in e || "buffer" in e))
            return new t(e); throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object."); }
        static concat(e, r) { if (e.length === 0)
            return t.alloc(0); let n = [].concat(...e.map(o => [...o])), i = t.alloc(r !== void 0 ? r : n.length); return i.set(r !== void 0 ? n.slice(0, r) : n), i; }
        slice(e = 0, r = this.length) { return this.subarray(e, r); }
        subarray(e = 0, r = this.length) { return Object.setPrototypeOf(super.subarray(e, r), t.prototype); }
        reverse() { return super.reverse(), this; }
        readIntBE(e, r) { $(e, "offset"), X(e, "offset"), j(e, "offset", this.length - 1), $(r, "byteLength"), X(r, "byteLength"); let n = new DataView(this.buffer, e, r), i = 0; for (let o = 0; o < r; o++)
            i = i * 256 + n.getUint8(o); return n.getUint8(0) & 128 && (i -= Math.pow(256, r)), i; }
        readIntLE(e, r) { $(e, "offset"), X(e, "offset"), j(e, "offset", this.length - 1), $(r, "byteLength"), X(r, "byteLength"); let n = new DataView(this.buffer, e, r), i = 0; for (let o = 0; o < r; o++)
            i += n.getUint8(o) * Math.pow(256, o); return n.getUint8(r - 1) & 128 && (i -= Math.pow(256, r)), i; }
        readUIntBE(e, r) { $(e, "offset"), X(e, "offset"), j(e, "offset", this.length - 1), $(r, "byteLength"), X(r, "byteLength"); let n = new DataView(this.buffer, e, r), i = 0; for (let o = 0; o < r; o++)
            i = i * 256 + n.getUint8(o); return i; }
        readUintBE(e, r) { return this.readUIntBE(e, r); }
        readUIntLE(e, r) { $(e, "offset"), X(e, "offset"), j(e, "offset", this.length - 1), $(r, "byteLength"), X(r, "byteLength"); let n = new DataView(this.buffer, e, r), i = 0; for (let o = 0; o < r; o++)
            i += n.getUint8(o) * Math.pow(256, o); return i; }
        readUintLE(e, r) { return this.readUIntLE(e, r); }
        writeIntBE(e, r, n) { return e = e < 0 ? e + Math.pow(256, n) : e, this.writeUIntBE(e, r, n); }
        writeIntLE(e, r, n) { return e = e < 0 ? e + Math.pow(256, n) : e, this.writeUIntLE(e, r, n); }
        writeUIntBE(e, r, n) { $(r, "offset"), X(r, "offset"), j(r, "offset", this.length - 1), $(n, "byteLength"), X(n, "byteLength"); let i = new DataView(this.buffer, r, n); for (let o = n - 1; o >= 0; o--)
            i.setUint8(o, e & 255), e = e / 256; return r + n; }
        writeUintBE(e, r, n) { return this.writeUIntBE(e, r, n); }
        writeUIntLE(e, r, n) { $(r, "offset"), X(r, "offset"), j(r, "offset", this.length - 1), $(n, "byteLength"), X(n, "byteLength"); let i = new DataView(this.buffer, r, n); for (let o = 0; o < n; o++)
            i.setUint8(o, e & 255), e = e / 256; return r + n; }
        writeUintLE(e, r, n) { return this.writeUIntLE(e, r, n); }
        toJSON() { return { type: "Buffer", data: Array.from(this) }; }
        swap16() { let e = new DataView(this.buffer, this.byteOffset, this.byteLength); for (let r = 0; r < this.length; r += 2)
            e.setUint16(r, e.getUint16(r, !0), !1); return this; }
        swap32() { let e = new DataView(this.buffer, this.byteOffset, this.byteLength); for (let r = 0; r < this.length; r += 4)
            e.setUint32(r, e.getUint32(r, !0), !1); return this; }
        swap64() { let e = new DataView(this.buffer, this.byteOffset, this.byteLength); for (let r = 0; r < this.length; r += 8)
            e.setBigUint64(r, e.getBigUint64(r, !0), !1); return this; }
        compare(e, r = 0, n = e.length, i = 0, o = this.length) { return Mt(e, "target"), $(r, "targetStart"), $(n, "targetEnd"), $(i, "sourceStart"), $(o, "sourceEnd"), j(r, "targetStart"), j(n, "targetEnd", e.length), j(i, "sourceStart"), j(o, "sourceEnd", this.length), t.compare(this.slice(i, o), e.slice(r, n)); }
        equals(e) { return Mt(e, "otherBuffer"), this.length === e.length && this.every((r, n) => r === e[n]); }
        copy(e, r = 0, n = 0, i = this.length) { j(r, "targetStart"), j(n, "sourceStart", this.length), j(i, "sourceEnd"), r >>>= 0, n >>>= 0, i >>>= 0; let o = 0; for (; n < i && !(this[n] === void 0 || e[r] === void 0);)
            e[r] = this[n], o++, n++, r++; return o; }
        write(e, r, n, i = "utf8") { let o = typeof r == "string" ? 0 : r ?? 0, s = typeof n == "string" ? this.length - o : n ?? this.length - o; return i = typeof r == "string" ? r : typeof n == "string" ? n : i, $(o, "offset"), $(s, "length"), j(o, "offset", this.length), j(s, "length", this.length), (i === "ucs2" || i === "ucs-2" || i === "utf16le" || i === "utf-16le") && (s = s - s % 2), Pr(e, i).copy(this, o, 0, s); }
        fill(e = 0, r = 0, n = this.length, i = "utf-8") { let o = typeof r == "string" ? 0 : r, s = typeof n == "string" ? this.length : n; if (i = typeof r == "string" ? r : typeof n == "string" ? n : i, e = t.from(typeof e == "number" ? [e] : e ?? [], i), dn(i, "encoding"), j(o, "offset", this.length), j(s, "end", this.length), e.length !== 0)
            for (let a = o; a < s; a += e.length)
                super.set(e.slice(0, e.length + a >= this.length ? this.length - a : e.length), a); return this; }
        includes(e, r = null, n = "utf-8") { return this.indexOf(e, r, n) !== -1; }
        lastIndexOf(e, r = null, n = "utf-8") { return this.indexOf(e, r, n, !0); }
        indexOf(e, r = null, n = "utf-8", i = !1) { let o = i ? this.findLastIndex.bind(this) : this.findIndex.bind(this); n = typeof r == "string" ? r : n; let s = t.from(typeof e == "number" ? [e] : e, n), a = typeof r == "string" ? 0 : r; return a = typeof r == "number" ? a : null, a = Number.isNaN(a) ? null : a, a ?? (a = i ? this.length : 0), a = a < 0 ? this.length + a : a, s.length === 0 && i === !1 ? a >= this.length ? this.length : a : s.length === 0 && i === !0 ? (a >= this.length ? this.length : a) || this.length : o((f, y) => (i ? y <= a : y >= a) && this[y] === s[0] && s.every((R, O) => this[y + O] === R)); }
        toString(e = "utf8", r = 0, n = this.length) { if (r = r < 0 ? 0 : r, e = e.toString().toLowerCase(), n <= 0)
            return ""; if (e === "utf8" || e === "utf-8")
            return ls.decode(this.slice(r, n)); if (e === "base64" || e === "base64url") {
            let i = btoa(this.reduce((o, s) => o + vr(s), ""));
            return e === "base64url" ? i.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : i;
        } if (e === "binary" || e === "ascii" || e === "latin1" || e === "latin-1")
            return this.slice(r, n).reduce((i, o) => i + vr(o & (e === "ascii" ? 127 : 255)), ""); if (e === "ucs2" || e === "ucs-2" || e === "utf16le" || e === "utf-16le") {
            let i = new DataView(this.buffer.slice(r, n));
            return Array.from({ length: i.byteLength / 2 }, (o, s) => s * 2 + 1 < i.byteLength ? vr(i.getUint16(s * 2, !0)) : "").join("");
        } if (e === "hex")
            return this.slice(r, n).reduce((i, o) => i + o.toString(16).padStart(2, "0"), ""); fn(`encoding "${e}"`); }
        toLocaleString() { return this.toString(); }
        inspect() { return `<Buffer ${this.toString("hex").match(/.{1,2}/g).join(" ")}>`; }
    };
    ss = { int8: [-128, 127], int16: [-32768, 32767], int32: [-2147483648, 2147483647], uint8: [0, 255], uint16: [0, 65535], uint32: [0, 4294967295], float32: [-1 / 0, 1 / 0], float64: [-1 / 0, 1 / 0], bigint64: [-0x8000000000000000n, 0x7fffffffffffffffn], biguint64: [0n, 0xffffffffffffffffn] }, as = new TextEncoder, ls = new TextDecoder, us = ["utf8", "utf-8", "hex", "base64", "ascii", "binary", "base64url", "ucs2", "ucs-2", "utf16le", "utf-16le", "latin1", "latin-1"], cs = 4294967295;
    is(h.prototype);
    b = new Proxy(ms, { construct(t, [e, r]) { return h.from(e, r); }, get(t, e) { return h[e]; } }), vr = String.fromCodePoint;
});
var g, x, c = ie(() => {
    "use strict";
    g = { nextTick: (t, ...e) => { setTimeout(() => { t(...e); }, 0); }, env: {}, version: "", cwd: () => "/", stderr: {}, argv: ["/bin/node"], pid: 1e4 }, { cwd: x } = g;
});
var P, m = ie(() => {
    "use strict";
    P = globalThis.performance ?? (() => { let t = Date.now(); return { now: () => Date.now() - t }; })();
});
var E, p = ie(() => {
    "use strict";
    E = () => { };
    E.prototype = E;
});
var w, d = ie(() => {
    "use strict";
    w = class {
        constructor(e) { this.value = e; }
        deref() { return this.value; }
    };
});
function bn(t, e) { var r, n, i, o, s, a, f, y, C = t.constructor, R = C.precision; if (!t.s || !e.s)
    return e.s || (e = new C(t)), q ? L(e, R) : e; if (f = t.d, y = e.d, s = t.e, i = e.e, f = f.slice(), o = s - i, o) {
    for (o < 0 ? (n = f, o = -o, a = y.length) : (n = y, i = s, a = f.length), s = Math.ceil(R / N), a = s > a ? s + 1 : a + 1, o > a && (o = a, n.length = 1), n.reverse(); o--;)
        n.push(0);
    n.reverse();
} for (a = f.length, o = y.length, a - o < 0 && (o = a, n = y, y = f, f = n), r = 0; o;)
    r = (f[--o] = f[o] + y[o] + r) / J | 0, f[o] %= J; for (r && (f.unshift(r), ++i), a = f.length; f[--a] == 0;)
    f.pop(); return e.d = f, e.e = i, q ? L(e, R) : e; }
function me(t, e, r) { if (t !== ~~t || t < e || t > r)
    throw Error(Ie + t); }
function ce(t) { var e, r, n, i = t.length - 1, o = "", s = t[0]; if (i > 0) {
    for (o += s, e = 1; e < i; e++)
        n = t[e] + "", r = N - n.length, r && (o += ve(r)), o += n;
    s = t[e], n = s + "", r = N - n.length, r && (o += ve(r));
}
else if (s === 0)
    return "0"; for (; s % 10 === 0;)
    s /= 10; return o + s; }
function wn(t, e) { var r, n, i, o, s, a, f = 0, y = 0, C = t.constructor, R = C.precision; if (V(t) > 16)
    throw Error(Cr + V(t)); if (!t.s)
    return new C(te); for (e == null ? (q = !1, a = R) : a = e, s = new C(.03125); t.abs().gte(.1);)
    t = t.times(s), y += 5; for (n = Math.log(Oe(2, y)) / Math.LN10 * 2 + 5 | 0, a += n, r = i = o = new C(te), C.precision = a;;) {
    if (i = L(i.times(t), a), r = r.times(++f), s = o.plus(be(i, r, a)), ce(s.d).slice(0, a) === ce(o.d).slice(0, a)) {
        for (; y--;)
            o = L(o.times(o), a);
        return C.precision = R, e == null ? (q = !0, L(o, R)) : o;
    }
    o = s;
} }
function V(t) { for (var e = t.e * N, r = t.d[0]; r >= 10; r /= 10)
    e++; return e; }
function Tr(t, e, r) { if (e > t.LN10.sd())
    throw q = !0, r && (t.precision = r), Error(oe + "LN10 precision limit exceeded"); return L(new t(t.LN10), e); }
function ve(t) { for (var e = ""; t--;)
    e += "0"; return e; }
function st(t, e) { var r, n, i, o, s, a, f, y, C, R = 1, O = 10, A = t, I = A.d, k = A.constructor, M = k.precision; if (A.s < 1)
    throw Error(oe + (A.s ? "NaN" : "-Infinity")); if (A.eq(te))
    return new k(0); if (e == null ? (q = !1, y = M) : y = e, A.eq(10))
    return e == null && (q = !0), Tr(k, y); if (y += O, k.precision = y, r = ce(I), n = r.charAt(0), o = V(A), Math.abs(o) < 15e14) {
    for (; n < 7 && n != 1 || n == 1 && r.charAt(1) > 3;)
        A = A.times(t), r = ce(A.d), n = r.charAt(0), R++;
    o = V(A), n > 1 ? (A = new k("0." + r), o++) : A = new k(n + "." + r.slice(1));
}
else
    return f = Tr(k, y + 2, M).times(o + ""), A = st(new k(n + "." + r.slice(1)), y - O).plus(f), k.precision = M, e == null ? (q = !0, L(A, M)) : A; for (a = s = A = be(A.minus(te), A.plus(te), y), C = L(A.times(A), y), i = 3;;) {
    if (s = L(s.times(C), y), f = a.plus(be(s, new k(i), y)), ce(f.d).slice(0, y) === ce(a.d).slice(0, y))
        return a = a.times(2), o !== 0 && (a = a.plus(Tr(k, y + 2, M).times(o + ""))), a = be(a, new k(R), y), k.precision = M, e == null ? (q = !0, L(a, M)) : a;
    a = f, i += 2;
} }
function gn(t, e) { var r, n, i; for ((r = e.indexOf(".")) > -1 && (e = e.replace(".", "")), (n = e.search(/e/i)) > 0 ? (r < 0 && (r = n), r += +e.slice(n + 1), e = e.substring(0, n)) : r < 0 && (r = e.length), n = 0; e.charCodeAt(n) === 48;)
    ++n; for (i = e.length; e.charCodeAt(i - 1) === 48;)
    --i; if (e = e.slice(n, i), e) {
    if (i -= n, r = r - n - 1, t.e = Ne(r / N), t.d = [], n = (r + 1) % N, r < 0 && (n += N), n < i) {
        for (n && t.d.push(+e.slice(0, n)), i -= N; n < i;)
            t.d.push(+e.slice(n, n += N));
        e = e.slice(n), n = N - e.length;
    }
    else
        n -= i;
    for (; n--;)
        e += "0";
    if (t.d.push(+e), q && (t.e > Dt || t.e < -Dt))
        throw Error(Cr + r);
}
else
    t.s = 0, t.e = 0, t.d = [0]; return t; }
function L(t, e, r) { var n, i, o, s, a, f, y, C, R = t.d; for (s = 1, o = R[0]; o >= 10; o /= 10)
    s++; if (n = e - s, n < 0)
    n += N, i = e, y = R[C = 0];
else {
    if (C = Math.ceil((n + 1) / N), o = R.length, C >= o)
        return t;
    for (y = o = R[C], s = 1; o >= 10; o /= 10)
        s++;
    n %= N, i = n - N + s;
} if (r !== void 0 && (o = Oe(10, s - i - 1), a = y / o % 10 | 0, f = e < 0 || R[C + 1] !== void 0 || y % o, f = r < 4 ? (a || f) && (r == 0 || r == (t.s < 0 ? 3 : 2)) : a > 5 || a == 5 && (r == 4 || f || r == 6 && (n > 0 ? i > 0 ? y / Oe(10, s - i) : 0 : R[C - 1]) % 10 & 1 || r == (t.s < 0 ? 8 : 7))), e < 1 || !R[0])
    return f ? (o = V(t), R.length = 1, e = e - o - 1, R[0] = Oe(10, (N - e % N) % N), t.e = Ne(-e / N) || 0) : (R.length = 1, R[0] = t.e = t.s = 0), t; if (n == 0 ? (R.length = C, o = 1, C--) : (R.length = C + 1, o = Oe(10, N - n), R[C] = i > 0 ? (y / Oe(10, s - i) % Oe(10, i) | 0) * o : 0), f)
    for (;;)
        if (C == 0) {
            (R[0] += o) == J && (R[0] = 1, ++t.e);
            break;
        }
        else {
            if (R[C] += o, R[C] != J)
                break;
            R[C--] = 0, o = 1;
        } for (n = R.length; R[--n] === 0;)
    R.pop(); if (q && (t.e > Dt || t.e < -Dt))
    throw Error(Cr + V(t)); return t; }
function En(t, e) { var r, n, i, o, s, a, f, y, C, R, O = t.constructor, A = O.precision; if (!t.s || !e.s)
    return e.s ? e.s = -e.s : e = new O(t), q ? L(e, A) : e; if (f = t.d, R = e.d, n = e.e, y = t.e, f = f.slice(), s = y - n, s) {
    for (C = s < 0, C ? (r = f, s = -s, a = R.length) : (r = R, n = y, a = f.length), i = Math.max(Math.ceil(A / N), a) + 2, s > i && (s = i, r.length = 1), r.reverse(), i = s; i--;)
        r.push(0);
    r.reverse();
}
else {
    for (i = f.length, a = R.length, C = i < a, C && (a = i), i = 0; i < a; i++)
        if (f[i] != R[i]) {
            C = f[i] < R[i];
            break;
        }
    s = 0;
} for (C && (r = f, f = R, R = r, e.s = -e.s), a = f.length, i = R.length - a; i > 0; --i)
    f[a++] = 0; for (i = R.length; i > s;) {
    if (f[--i] < R[i]) {
        for (o = i; o && f[--o] === 0;)
            f[o] = J - 1;
        --f[o], f[i] += J;
    }
    f[i] -= R[i];
} for (; f[--a] === 0;)
    f.pop(); for (; f[0] === 0; f.shift())
    --n; return f[0] ? (e.d = f, e.e = n, q ? L(e, A) : e) : new O(0); }
function Me(t, e, r) { var n, i = V(t), o = ce(t.d), s = o.length; return e ? (r && (n = r - s) > 0 ? o = o.charAt(0) + "." + o.slice(1) + ve(n) : s > 1 && (o = o.charAt(0) + "." + o.slice(1)), o = o + (i < 0 ? "e" : "e+") + i) : i < 0 ? (o = "0." + ve(-i - 1) + o, r && (n = r - s) > 0 && (o += ve(n))) : i >= s ? (o += ve(i + 1 - s), r && (n = r - i - 1) > 0 && (o = o + "." + ve(n))) : ((n = i + 1) < s && (o = o.slice(0, n) + "." + o.slice(n)), r && (n = r - s) > 0 && (i + 1 === s && (o += "."), o += ve(n))), t.s < 0 ? "-" + o : o; }
function yn(t, e) { if (t.length > e)
    return t.length = e, !0; }
function xn(t) { var e, r, n; function i(o) { var s = this; if (!(s instanceof i))
    return new i(o); if (s.constructor = i, o instanceof i) {
    s.s = o.s, s.e = o.e, s.d = (o = o.d) ? o.slice() : o;
    return;
} if (typeof o == "number") {
    if (o * 0 !== 0)
        throw Error(Ie + o);
    if (o > 0)
        s.s = 1;
    else if (o < 0)
        o = -o, s.s = -1;
    else {
        s.s = 0, s.e = 0, s.d = [0];
        return;
    }
    if (o === ~~o && o < 1e7) {
        s.e = 0, s.d = [o];
        return;
    }
    return gn(s, o.toString());
}
else if (typeof o != "string")
    throw Error(Ie + o); if (o.charCodeAt(0) === 45 ? (o = o.slice(1), s.s = -1) : s.s = 1, ds.test(o))
    gn(s, o);
else
    throw Error(Ie + o); } if (i.prototype = S, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.clone = xn, i.config = i.set = fs, t === void 0 && (t = {}), t)
    for (n = ["precision", "rounding", "toExpNeg", "toExpPos", "LN10"], e = 0; e < n.length;)
        t.hasOwnProperty(r = n[e++]) || (t[r] = this[r]); return i.config(t), i; }
function fs(t) { if (!t || typeof t != "object")
    throw Error(oe + "Object expected"); var e, r, n, i = ["precision", 1, Ue, "rounding", 0, 8, "toExpNeg", -1 / 0, 0, "toExpPos", 0, 1 / 0]; for (e = 0; e < i.length; e += 3)
    if ((n = t[r = i[e]]) !== void 0)
        if (Ne(n) === n && n >= i[e + 1] && n <= i[e + 2])
            this[r] = n;
        else
            throw Error(Ie + r + ": " + n); if ((n = t[r = "LN10"]) !== void 0)
    if (n == Math.LN10)
        this[r] = new this(n);
    else
        throw Error(Ie + r + ": " + n); return this; }
var Ue, ps, Rr, q, oe, Ie, Cr, Ne, Oe, ds, te, J, N, hn, Dt, S, be, Rr, _t, Pn = ie(() => {
    "use strict";
    u();
    c();
    m();
    p();
    d();
    l();
    Ue = 1e9, ps = { precision: 20, rounding: 4, toExpNeg: -7, toExpPos: 21, LN10: "2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286" }, q = !0, oe = "[DecimalError] ", Ie = oe + "Invalid argument: ", Cr = oe + "Exponent out of range: ", Ne = Math.floor, Oe = Math.pow, ds = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, J = 1e7, N = 7, hn = 9007199254740991, Dt = Ne(hn / N), S = {};
    S.absoluteValue = S.abs = function () { var t = new this.constructor(this); return t.s && (t.s = 1), t; };
    S.comparedTo = S.cmp = function (t) { var e, r, n, i, o = this; if (t = new o.constructor(t), o.s !== t.s)
        return o.s || -t.s; if (o.e !== t.e)
        return o.e > t.e ^ o.s < 0 ? 1 : -1; for (n = o.d.length, i = t.d.length, e = 0, r = n < i ? n : i; e < r; ++e)
        if (o.d[e] !== t.d[e])
            return o.d[e] > t.d[e] ^ o.s < 0 ? 1 : -1; return n === i ? 0 : n > i ^ o.s < 0 ? 1 : -1; };
    S.decimalPlaces = S.dp = function () { var t = this, e = t.d.length - 1, r = (e - t.e) * N; if (e = t.d[e], e)
        for (; e % 10 == 0; e /= 10)
            r--; return r < 0 ? 0 : r; };
    S.dividedBy = S.div = function (t) { return be(this, new this.constructor(t)); };
    S.dividedToIntegerBy = S.idiv = function (t) { var e = this, r = e.constructor; return L(be(e, new r(t), 0, 1), r.precision); };
    S.equals = S.eq = function (t) { return !this.cmp(t); };
    S.exponent = function () { return V(this); };
    S.greaterThan = S.gt = function (t) { return this.cmp(t) > 0; };
    S.greaterThanOrEqualTo = S.gte = function (t) { return this.cmp(t) >= 0; };
    S.isInteger = S.isint = function () { return this.e > this.d.length - 2; };
    S.isNegative = S.isneg = function () { return this.s < 0; };
    S.isPositive = S.ispos = function () { return this.s > 0; };
    S.isZero = function () { return this.s === 0; };
    S.lessThan = S.lt = function (t) { return this.cmp(t) < 0; };
    S.lessThanOrEqualTo = S.lte = function (t) { return this.cmp(t) < 1; };
    S.logarithm = S.log = function (t) { var e, r = this, n = r.constructor, i = n.precision, o = i + 5; if (t === void 0)
        t = new n(10);
    else if (t = new n(t), t.s < 1 || t.eq(te))
        throw Error(oe + "NaN"); if (r.s < 1)
        throw Error(oe + (r.s ? "NaN" : "-Infinity")); return r.eq(te) ? new n(0) : (q = !1, e = be(st(r, o), st(t, o), o), q = !0, L(e, i)); };
    S.minus = S.sub = function (t) { var e = this; return t = new e.constructor(t), e.s == t.s ? En(e, t) : bn(e, (t.s = -t.s, t)); };
    S.modulo = S.mod = function (t) { var e, r = this, n = r.constructor, i = n.precision; if (t = new n(t), !t.s)
        throw Error(oe + "NaN"); return r.s ? (q = !1, e = be(r, t, 0, 1).times(t), q = !0, r.minus(e)) : L(new n(r), i); };
    S.naturalExponential = S.exp = function () { return wn(this); };
    S.naturalLogarithm = S.ln = function () { return st(this); };
    S.negated = S.neg = function () { var t = new this.constructor(this); return t.s = -t.s || 0, t; };
    S.plus = S.add = function (t) { var e = this; return t = new e.constructor(t), e.s == t.s ? bn(e, t) : En(e, (t.s = -t.s, t)); };
    S.precision = S.sd = function (t) { var e, r, n, i = this; if (t !== void 0 && t !== !!t && t !== 1 && t !== 0)
        throw Error(Ie + t); if (e = V(i) + 1, n = i.d.length - 1, r = n * N + 1, n = i.d[n], n) {
        for (; n % 10 == 0; n /= 10)
            r--;
        for (n = i.d[0]; n >= 10; n /= 10)
            r++;
    } return t && e > r ? e : r; };
    S.squareRoot = S.sqrt = function () { var t, e, r, n, i, o, s, a = this, f = a.constructor; if (a.s < 1) {
        if (!a.s)
            return new f(0);
        throw Error(oe + "NaN");
    } for (t = V(a), q = !1, i = Math.sqrt(+a), i == 0 || i == 1 / 0 ? (e = ce(a.d), (e.length + t) % 2 == 0 && (e += "0"), i = Math.sqrt(e), t = Ne((t + 1) / 2) - (t < 0 || t % 2), i == 1 / 0 ? e = "5e" + t : (e = i.toExponential(), e = e.slice(0, e.indexOf("e") + 1) + t), n = new f(e)) : n = new f(i.toString()), r = f.precision, i = s = r + 3;;)
        if (o = n, n = o.plus(be(a, o, s + 2)).times(.5), ce(o.d).slice(0, s) === (e = ce(n.d)).slice(0, s)) {
            if (e = e.slice(s - 3, s + 1), i == s && e == "4999") {
                if (L(o, r + 1, 0), o.times(o).eq(a)) {
                    n = o;
                    break;
                }
            }
            else if (e != "9999")
                break;
            s += 4;
        } return q = !0, L(n, r); };
    S.times = S.mul = function (t) { var e, r, n, i, o, s, a, f, y, C = this, R = C.constructor, O = C.d, A = (t = new R(t)).d; if (!C.s || !t.s)
        return new R(0); for (t.s *= C.s, r = C.e + t.e, f = O.length, y = A.length, f < y && (o = O, O = A, A = o, s = f, f = y, y = s), o = [], s = f + y, n = s; n--;)
        o.push(0); for (n = y; --n >= 0;) {
        for (e = 0, i = f + n; i > n;)
            a = o[i] + A[n] * O[i - n - 1] + e, o[i--] = a % J | 0, e = a / J | 0;
        o[i] = (o[i] + e) % J | 0;
    } for (; !o[--s];)
        o.pop(); return e ? ++r : o.shift(), t.d = o, t.e = r, q ? L(t, R.precision) : t; };
    S.toDecimalPlaces = S.todp = function (t, e) { var r = this, n = r.constructor; return r = new n(r), t === void 0 ? r : (me(t, 0, Ue), e === void 0 ? e = n.rounding : me(e, 0, 8), L(r, t + V(r) + 1, e)); };
    S.toExponential = function (t, e) { var r, n = this, i = n.constructor; return t === void 0 ? r = Me(n, !0) : (me(t, 0, Ue), e === void 0 ? e = i.rounding : me(e, 0, 8), n = L(new i(n), t + 1, e), r = Me(n, !0, t + 1)), r; };
    S.toFixed = function (t, e) { var r, n, i = this, o = i.constructor; return t === void 0 ? Me(i) : (me(t, 0, Ue), e === void 0 ? e = o.rounding : me(e, 0, 8), n = L(new o(i), t + V(i) + 1, e), r = Me(n.abs(), !1, t + V(n) + 1), i.isneg() && !i.isZero() ? "-" + r : r); };
    S.toInteger = S.toint = function () { var t = this, e = t.constructor; return L(new e(t), V(t) + 1, e.rounding); };
    S.toNumber = function () { return +this; };
    S.toPower = S.pow = function (t) { var e, r, n, i, o, s, a = this, f = a.constructor, y = 12, C = +(t = new f(t)); if (!t.s)
        return new f(te); if (a = new f(a), !a.s) {
        if (t.s < 1)
            throw Error(oe + "Infinity");
        return a;
    } if (a.eq(te))
        return a; if (n = f.precision, t.eq(te))
        return L(a, n); if (e = t.e, r = t.d.length - 1, s = e >= r, o = a.s, s) {
        if ((r = C < 0 ? -C : C) <= hn) {
            for (i = new f(te), e = Math.ceil(n / N + 4), q = !1; r % 2 && (i = i.times(a), yn(i.d, e)), r = Ne(r / 2), r !== 0;)
                a = a.times(a), yn(a.d, e);
            return q = !0, t.s < 0 ? new f(te).div(i) : L(i, n);
        }
    }
    else if (o < 0)
        throw Error(oe + "NaN"); return o = o < 0 && t.d[Math.max(e, r)] & 1 ? -1 : 1, a.s = 1, q = !1, i = t.times(st(a, n + y)), q = !0, i = wn(i), i.s = o, i; };
    S.toPrecision = function (t, e) { var r, n, i = this, o = i.constructor; return t === void 0 ? (r = V(i), n = Me(i, r <= o.toExpNeg || r >= o.toExpPos)) : (me(t, 1, Ue), e === void 0 ? e = o.rounding : me(e, 0, 8), i = L(new o(i), t, e), r = V(i), n = Me(i, t <= r || r <= o.toExpNeg, t)), n; };
    S.toSignificantDigits = S.tosd = function (t, e) { var r = this, n = r.constructor; return t === void 0 ? (t = n.precision, e = n.rounding) : (me(t, 1, Ue), e === void 0 ? e = n.rounding : me(e, 0, 8)), L(new n(r), t, e); };
    S.toString = S.valueOf = S.val = S.toJSON = S[Symbol.for("nodejs.util.inspect.custom")] = function () { var t = this, e = V(t), r = t.constructor; return Me(t, e <= r.toExpNeg || e >= r.toExpPos); };
    be = function () { function t(n, i) { var o, s = 0, a = n.length; for (n = n.slice(); a--;)
        o = n[a] * i + s, n[a] = o % J | 0, s = o / J | 0; return s && n.unshift(s), n; } function e(n, i, o, s) { var a, f; if (o != s)
        f = o > s ? 1 : -1;
    else
        for (a = f = 0; a < o; a++)
            if (n[a] != i[a]) {
                f = n[a] > i[a] ? 1 : -1;
                break;
            } return f; } function r(n, i, o) { for (var s = 0; o--;)
        n[o] -= s, s = n[o] < i[o] ? 1 : 0, n[o] = s * J + n[o] - i[o]; for (; !n[0] && n.length > 1;)
        n.shift(); } return function (n, i, o, s) { var a, f, y, C, R, O, A, I, k, M, se, z, F, Y, ke, xr, ae, kt, Ot = n.constructor, Yo = n.s == i.s ? 1 : -1, ue = n.d, B = i.d; if (!n.s)
        return new Ot(n); if (!i.s)
        throw Error(oe + "Division by zero"); for (f = n.e - i.e, ae = B.length, ke = ue.length, A = new Ot(Yo), I = A.d = [], y = 0; B[y] == (ue[y] || 0);)
        ++y; if (B[y] > (ue[y] || 0) && --f, o == null ? z = o = Ot.precision : s ? z = o + (V(n) - V(i)) + 1 : z = o, z < 0)
        return new Ot(0); if (z = z / N + 2 | 0, y = 0, ae == 1)
        for (C = 0, B = B[0], z++; (y < ke || C) && z--; y++)
            F = C * J + (ue[y] || 0), I[y] = F / B | 0, C = F % B | 0;
    else {
        for (C = J / (B[0] + 1) | 0, C > 1 && (B = t(B, C), ue = t(ue, C), ae = B.length, ke = ue.length), Y = ae, k = ue.slice(0, ae), M = k.length; M < ae;)
            k[M++] = 0;
        kt = B.slice(), kt.unshift(0), xr = B[0], B[1] >= J / 2 && ++xr;
        do
            C = 0, a = e(B, k, ae, M), a < 0 ? (se = k[0], ae != M && (se = se * J + (k[1] || 0)), C = se / xr | 0, C > 1 ? (C >= J && (C = J - 1), R = t(B, C), O = R.length, M = k.length, a = e(R, k, O, M), a == 1 && (C--, r(R, ae < O ? kt : B, O))) : (C == 0 && (a = C = 1), R = B.slice()), O = R.length, O < M && R.unshift(0), r(k, R, M), a == -1 && (M = k.length, a = e(B, k, ae, M), a < 1 && (C++, r(k, ae < M ? kt : B, M))), M = k.length) : a === 0 && (C++, k = [0]), I[y++] = C, a && k[0] ? k[M++] = ue[Y] || 0 : (k = [ue[Y]], M = 1);
        while ((Y++ < ke || k[0] !== void 0) && z--);
    } return I[0] || I.shift(), A.e = f, L(A, s ? o + V(A) + 1 : o); }; }();
    Rr = xn(ps);
    te = new Rr(1);
    _t = Rr;
});
var T, pe, l = ie(() => {
    "use strict";
    Pn();
    T = class extends _t {
        static isDecimal(e) { return e instanceof _t; }
        static random(e = 20) { {
            let n = globalThis.crypto.getRandomValues(new Uint8Array(e)).reduce((i, o) => i + o, "");
            return new _t(`0.${n.slice(0, e)}`);
        } }
    }, pe = T;
});
function Es() { return !1; }
function Ir() { return { dev: 0, ino: 0, mode: 0, nlink: 0, uid: 0, gid: 0, rdev: 0, size: 0, blksize: 0, blocks: 0, atimeMs: 0, mtimeMs: 0, ctimeMs: 0, birthtimeMs: 0, atime: new Date, mtime: new Date, ctime: new Date, birthtime: new Date }; }
function xs() { return Ir(); }
function Ps() { return []; }
function vs(t) { t(null, []); }
function Ts() { return ""; }
function Cs() { return ""; }
function Rs() { }
function As() { }
function Ss() { }
function ks() { }
function Os() { }
function Is() { }
function Ms() { }
function Ds() { }
function _s() { return { close: () => { }, on: () => { }, removeAllListeners: () => { } }; }
function Ls(t, e) { e(null, Ir()); }
var Fs, Us, qn, Bn = ie(() => {
    "use strict";
    u();
    c();
    m();
    p();
    d();
    l();
    Fs = {}, Us = { existsSync: Es, lstatSync: Ir, stat: Ls, statSync: xs, readdirSync: Ps, readdir: vs, readlinkSync: Ts, realpathSync: Cs, chmodSync: Rs, renameSync: As, mkdirSync: Ss, rmdirSync: ks, rmSync: Os, unlinkSync: Is, watchFile: Ms, unwatchFile: Ds, watch: _s, promises: Fs }, qn = Us;
});
function Ns(...t) { return t.join("/"); }
function qs(...t) { return t.join("/"); }
function Bs(t) { let e = $n(t), r = Vn(t), [n, i] = e.split("."); return { root: "/", dir: r, base: e, ext: i, name: n }; }
function $n(t) { let e = t.split("/"); return e[e.length - 1]; }
function Vn(t) { return t.split("/").slice(0, -1).join("/"); }
function Vs(t) { let e = t.split("/").filter(i => i !== "" && i !== "."), r = []; for (let i of e)
    i === ".." ? r.pop() : r.push(i); let n = r.join("/"); return t.startsWith("/") ? "/" + n : n; }
var jn, $s, js, Qs, Nt, Qn = ie(() => {
    "use strict";
    u();
    c();
    m();
    p();
    d();
    l();
    jn = "/", $s = ":";
    js = { sep: jn }, Qs = { basename: $n, delimiter: $s, dirname: Vn, join: qs, normalize: Vs, parse: Bs, posix: js, resolve: Ns, sep: jn }, Nt = Qs;
});
var Jn = Fe((am, Js) => { Js.exports = { name: "@prisma/internals", version: "6.13.0", description: "This package is intended for Prisma's internal use", main: "dist/index.js", types: "dist/index.d.ts", repository: { type: "git", url: "https://github.com/prisma/prisma.git", directory: "packages/internals" }, homepage: "https://www.prisma.io", author: "Tim Suchanek <suchanek@prisma.io>", bugs: "https://github.com/prisma/prisma/issues", license: "Apache-2.0", scripts: { dev: "DEV=true tsx helpers/build.ts", build: "tsx helpers/build.ts", test: "dotenv -e ../../.db.env -- jest --silent", prepublishOnly: "pnpm run build" }, files: ["README.md", "dist", "!**/libquery_engine*", "!dist/get-generators/engines/*", "scripts"], devDependencies: { "@babel/helper-validator-identifier": "7.25.9", "@opentelemetry/api": "1.9.0", "@swc/core": "1.11.5", "@swc/jest": "0.2.37", "@types/babel__helper-validator-identifier": "7.15.2", "@types/jest": "29.5.14", "@types/node": "18.19.76", "@types/resolve": "1.20.6", archiver: "6.0.2", "checkpoint-client": "1.1.33", "cli-truncate": "4.0.0", dotenv: "16.5.0", esbuild: "0.25.5", "escape-string-regexp": "5.0.0", execa: "5.1.1", "fast-glob": "3.3.3", "find-up": "7.0.0", "fp-ts": "2.16.9", "fs-extra": "11.3.0", "fs-jetpack": "5.1.0", "global-dirs": "4.0.0", globby: "11.1.0", "identifier-regex": "1.0.0", "indent-string": "4.0.0", "is-windows": "1.0.2", "is-wsl": "3.1.0", jest: "29.7.0", "jest-junit": "16.0.0", kleur: "4.1.5", "mock-stdin": "1.0.0", "new-github-issue-url": "0.2.1", "node-fetch": "3.3.2", "npm-packlist": "5.1.3", open: "7.4.2", "p-map": "4.0.0", "read-package-up": "11.0.0", resolve: "1.22.10", "string-width": "7.2.0", "strip-ansi": "6.0.1", "strip-indent": "4.0.0", "temp-dir": "2.0.0", tempy: "1.0.1", "terminal-link": "4.0.0", tmp: "0.2.3", "ts-node": "10.9.2", "ts-pattern": "5.6.2", "ts-toolbelt": "9.6.0", typescript: "5.4.5", yarn: "1.22.22" }, dependencies: { "@prisma/config": "workspace:*", "@prisma/debug": "workspace:*", "@prisma/dmmf": "workspace:*", "@prisma/driver-adapter-utils": "workspace:*", "@prisma/engines": "workspace:*", "@prisma/fetch-engine": "workspace:*", "@prisma/generator": "workspace:*", "@prisma/generator-helper": "workspace:*", "@prisma/get-platform": "workspace:*", "@prisma/prisma-schema-wasm": "6.13.0-35.361e86d0ea4987e9f53a565309b3eed797a6bcbd", "@prisma/schema-engine-wasm": "6.13.0-35.361e86d0ea4987e9f53a565309b3eed797a6bcbd", "@prisma/schema-files-loader": "workspace:*", arg: "5.0.2", prompts: "2.4.2" }, peerDependencies: { typescript: ">=5.1.0" }, peerDependenciesMeta: { typescript: { optional: !0 } }, sideEffects: !1 }; });
var zn = Fe((wp, Hn) => {
    "use strict";
    u();
    c();
    m();
    p();
    d();
    l();
    Hn.exports = (t, e = 1, r) => { if (r = { indent: " ", includeEmptyLines: !1, ...r }, typeof t != "string")
        throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof t}\``); if (typeof e != "number")
        throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof e}\``); if (typeof r.indent != "string")
        throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof r.indent}\``); if (e === 0)
        return t; let n = r.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm; return t.replace(n, r.indent.repeat(e)); };
});
var Zn = Fe((Dp, Xn) => {
    "use strict";
    u();
    c();
    m();
    p();
    d();
    l();
    Xn.exports = ({ onlyFirst: t = !1 } = {}) => { let e = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|"); return new RegExp(e, t ? void 0 : "g"); };
});
var ti = Fe((Bp, ei) => {
    "use strict";
    u();
    c();
    m();
    p();
    d();
    l();
    var ta = Zn();
    ei.exports = t => typeof t == "string" ? t.replace(ta(), "") : t;
});
var $r = Fe((ih, si) => {
    "use strict";
    u();
    c();
    m();
    p();
    d();
    l();
    si.exports = function () { function t(e, r, n, i, o) { return e < r || n < r ? e > n ? n + 1 : e + 1 : i === o ? r : r + 1; } return function (e, r) { if (e === r)
        return 0; if (e.length > r.length) {
        var n = e;
        e = r, r = n;
    } for (var i = e.length, o = r.length; i > 0 && e.charCodeAt(i - 1) === r.charCodeAt(o - 1);)
        i--, o--; for (var s = 0; s < i && e.charCodeAt(s) === r.charCodeAt(s);)
        s++; if (i -= s, o -= s, i === 0 || o < 3)
        return o; var a = 0, f, y, C, R, O, A, I, k, M, se, z, F, Y = []; for (f = 0; f < i; f++)
        Y.push(f + 1), Y.push(e.charCodeAt(s + f)); for (var ke = Y.length - 1; a < o - 3;)
        for (M = r.charCodeAt(s + (y = a)), se = r.charCodeAt(s + (C = a + 1)), z = r.charCodeAt(s + (R = a + 2)), F = r.charCodeAt(s + (O = a + 3)), A = a += 4, f = 0; f < ke; f += 2)
            I = Y[f], k = Y[f + 1], y = t(I, y, C, M, k), C = t(y, C, R, se, k), R = t(C, R, O, z, k), A = t(R, O, A, F, k), Y[f] = A, O = R, R = C, C = y, y = I; for (; a < o;)
        for (M = r.charCodeAt(s + (y = a)), A = ++a, f = 0; f < ke; f += 2)
            I = Y[f], Y[f] = A = t(I, y, A, M, Y[f + 1]), y = I; return A; }; }();
});
var mi = ie(() => {
    "use strict";
    u();
    c();
    m();
    p();
    d();
    l();
});
var pi = ie(() => {
    "use strict";
    u();
    c();
    m();
    p();
    d();
    l();
});
var Fi = Fe((ov, Ka) => { Ka.exports = { name: "@prisma/engines-version", version: "6.13.0-35.361e86d0ea4987e9f53a565309b3eed797a6bcbd", main: "index.js", types: "index.d.ts", license: "Apache-2.0", author: "Tim Suchanek <suchanek@prisma.io>", prisma: { enginesVersion: "361e86d0ea4987e9f53a565309b3eed797a6bcbd" }, repository: { type: "git", url: "https://github.com/prisma/engines-wrapper.git", directory: "packages/engines-version" }, devDependencies: { "@types/node": "18.19.76", typescript: "4.9.5" }, files: ["index.js", "index.d.ts"], scripts: { build: "tsc -d" } }; });
var sr, Ui = ie(() => {
    "use strict";
    u();
    c();
    m();
    p();
    d();
    l();
    sr = class {
        constructor() {
            this.events = {};
        }
        on(e, r) { return this.events[e] || (this.events[e] = []), this.events[e].push(r), this; }
        emit(e, ...r) { return this.events[e] ? (this.events[e].forEach(n => { n(...r); }), !0) : !1; }
    };
});
var Zl = {};
it(Zl, { DMMF: () => dt, Debug: () => G, Decimal: () => pe, Extensions: () => Ar, MetricsClient: () => Ze, PrismaClientInitializationError: () => D, PrismaClientKnownRequestError: () => Z, PrismaClientRustPanicError: () => xe, PrismaClientUnknownRequestError: () => Q, PrismaClientValidationError: () => K, Public: () => Sr, Sql: () => ee, createParam: () => Si, defineDmmfProperty: () => _i, deserializeJsonResponse: () => Ve, deserializeRawResult: () => wr, dmmfToRuntimeDataModel: () => oi, empty: () => qi, getPrismaClient: () => Ko, getRuntime: () => Ae, join: () => Ni, makeStrictEnum: () => Ho, makeTypedQueryFactory: () => Li, objectEnumValues: () => zt, raw: () => zr, serializeJsonQuery: () => nr, skip: () => rr, sqltag: () => Yr, warnEnvConflicts: () => void 0, warnOnce: () => ct });
module.exports = ns(Zl);
u();
c();
m();
p();
d();
l();
var Ar = {};
it(Ar, { defineExtension: () => vn, getExtensionContext: () => Tn });
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
function vn(t) { return typeof t == "function" ? t : e => e.$extends(t); }
u();
c();
m();
p();
d();
l();
function Tn(t) { return t; }
var Sr = {};
it(Sr, { validator: () => Cn });
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
function Cn(...t) { return e => e; }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var kr, Rn, An, Sn, kn = !0;
typeof g < "u" && ({ FORCE_COLOR: kr, NODE_DISABLE_COLORS: Rn, NO_COLOR: An, TERM: Sn } = g.env || {}, kn = g.stdout && g.stdout.isTTY);
var gs = { enabled: !Rn && An == null && Sn !== "dumb" && (kr != null && kr !== "0" || kn) };
function U(t, e) { let r = new RegExp(`\\x1b\\[${e}m`, "g"), n = `\x1B[${t}m`, i = `\x1B[${e}m`; return function (o) { return !gs.enabled || o == null ? o : n + (~("" + o).indexOf(i) ? o.replace(r, i + n) : o) + i; }; }
var Yu = U(0, 0), Lt = U(1, 22), Ft = U(2, 22), Xu = U(3, 23), On = U(4, 24), Zu = U(7, 27), ec = U(8, 28), tc = U(9, 29), rc = U(30, 39), qe = U(31, 39), In = U(32, 39), Mn = U(33, 39), Dn = U(34, 39), nc = U(35, 39), _n = U(36, 39), ic = U(37, 39), Ln = U(90, 39), oc = U(90, 39), sc = U(40, 49), ac = U(41, 49), lc = U(42, 49), uc = U(43, 49), cc = U(44, 49), mc = U(45, 49), pc = U(46, 49), dc = U(47, 49);
u();
c();
m();
p();
d();
l();
var ys = 100, Fn = ["green", "yellow", "blue", "magenta", "cyan", "red"], Ut = [], Un = Date.now(), hs = 0, Or = typeof g < "u" ? g.env : {};
globalThis.DEBUG ?? (globalThis.DEBUG = Or.DEBUG ?? "");
globalThis.DEBUG_COLORS ?? (globalThis.DEBUG_COLORS = Or.DEBUG_COLORS ? Or.DEBUG_COLORS === "true" : !0);
var at = { enable(t) { typeof t == "string" && (globalThis.DEBUG = t); }, disable() { let t = globalThis.DEBUG; return globalThis.DEBUG = "", t; }, enabled(t) { let e = globalThis.DEBUG.split(",").map(i => i.replace(/[.+?^${}()|[\]\\]/g, "\\$&")), r = e.some(i => i === "" || i[0] === "-" ? !1 : t.match(RegExp(i.split("*").join(".*") + "$"))), n = e.some(i => i === "" || i[0] !== "-" ? !1 : t.match(RegExp(i.slice(1).split("*").join(".*") + "$"))); return r && !n; }, log: (...t) => { let [e, r, ...n] = t; (console.warn ?? console.log)(`${e} ${r}`, ...n); }, formatters: {} };
function bs(t) { let e = { color: Fn[hs++ % Fn.length], enabled: at.enabled(t), namespace: t, log: at.log, extend: () => { } }, r = (...n) => { let { enabled: i, namespace: o, color: s, log: a } = e; if (n.length !== 0 && Ut.push([o, ...n]), Ut.length > ys && Ut.shift(), at.enabled(o) || i) {
    let f = n.map(C => typeof C == "string" ? C : ws(C)), y = `+${Date.now() - Un}ms`;
    Un = Date.now(), a(o, ...f, y);
} }; return new Proxy(r, { get: (n, i) => e[i], set: (n, i, o) => e[i] = o }); }
var G = new Proxy(bs, { get: (t, e) => at[e], set: (t, e, r) => at[e] = r });
function ws(t, e = 2) { let r = new Set; return JSON.stringify(t, (n, i) => { if (typeof i == "object" && i !== null) {
    if (r.has(i))
        return "[Circular *]";
    r.add(i);
}
else if (typeof i == "bigint")
    return i.toString(); return i; }, e); }
function Nn() { Ut.length = 0; }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var Mr = ["darwin", "darwin-arm64", "debian-openssl-1.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x", "rhel-openssl-1.0.x", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x", "linux-arm64-openssl-1.1.x", "linux-arm64-openssl-1.0.x", "linux-arm64-openssl-3.0.x", "linux-arm-openssl-1.1.x", "linux-arm-openssl-1.0.x", "linux-arm-openssl-3.0.x", "linux-musl", "linux-musl-openssl-3.0.x", "linux-musl-arm64-openssl-1.1.x", "linux-musl-arm64-openssl-3.0.x", "linux-nixos", "linux-static-x64", "linux-static-arm64", "windows", "freebsd11", "freebsd12", "freebsd13", "freebsd14", "freebsd15", "openbsd", "netbsd", "arm"];
u();
c();
m();
p();
d();
l();
var Gs = Jn(), Dr = Gs.version;
u();
c();
m();
p();
d();
l();
function Be(t) { let e = Ws(); return e || (t?.config.engineType === "library" ? "library" : t?.config.engineType === "binary" ? "binary" : t?.config.engineType === "client" ? "client" : Ks(t)); }
function Ws() { let t = g.env.PRISMA_CLIENT_ENGINE_TYPE; return t === "library" ? "library" : t === "binary" ? "binary" : t === "client" ? "client" : void 0; }
function Ks(t) { return t?.previewFeatures.includes("queryCompiler") ? "client" : "library"; }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
function _r(t) { return t.name === "DriverAdapterError" && typeof t.cause == "object"; }
u();
c();
m();
p();
d();
l();
function qt(t) { return { ok: !0, value: t, map(e) { return qt(e(t)); }, flatMap(e) { return e(t); } }; }
function De(t) { return { ok: !1, error: t, map() { return De(t); }, flatMap() { return De(t); } }; }
var Gn = G("driver-adapter-utils"), Lr = class {
    constructor() {
        this.registeredErrors = [];
    }
    consumeError(e) { return this.registeredErrors[e]; }
    registerNewError(e) { let r = 0; for (; this.registeredErrors[r] !== void 0;)
        r++; return this.registeredErrors[r] = { error: e }, r; }
};
var Bt = (t, e = new Lr) => { let r = { adapterName: t.adapterName, errorRegistry: e, queryRaw: we(e, t.queryRaw.bind(t)), executeRaw: we(e, t.executeRaw.bind(t)), executeScript: we(e, t.executeScript.bind(t)), dispose: we(e, t.dispose.bind(t)), provider: t.provider, startTransaction: async (...n) => (await we(e, t.startTransaction.bind(t))(...n)).map(o => Hs(e, o)) }; return t.getConnectionInfo && (r.getConnectionInfo = zs(e, t.getConnectionInfo.bind(t))), r; }, Hs = (t, e) => ({ adapterName: e.adapterName, provider: e.provider, options: e.options, queryRaw: we(t, e.queryRaw.bind(e)), executeRaw: we(t, e.executeRaw.bind(e)), commit: we(t, e.commit.bind(e)), rollback: we(t, e.rollback.bind(e)) });
function we(t, e) { return async (...r) => { try {
    return qt(await e(...r));
}
catch (n) {
    if (Gn("[error@wrapAsync]", n), _r(n))
        return De(n.cause);
    let i = t.registerNewError(n);
    return De({ kind: "GenericJs", id: i });
} }; }
function zs(t, e) { return (...r) => { try {
    return qt(e(...r));
}
catch (n) {
    if (Gn("[error@wrapSync]", n), _r(n))
        return De(n.cause);
    let i = t.registerNewError(n);
    return De({ kind: "GenericJs", id: i });
} }; }
u();
c();
m();
p();
d();
l();
var Wn = "prisma+postgres", Kn = `${Wn}:`;
function Fr(t) { return t?.toString().startsWith(`${Kn}//`) ?? !1; }
var ut = {};
it(ut, { error: () => Zs, info: () => Xs, log: () => Ys, query: () => ea, should: () => Yn, tags: () => lt, warn: () => Ur });
u();
c();
m();
p();
d();
l();
var lt = { error: qe("prisma:error"), warn: Mn("prisma:warn"), info: _n("prisma:info"), query: Dn("prisma:query") }, Yn = { warn: () => !g.env.PRISMA_DISABLE_WARNINGS };
function Ys(...t) { console.log(...t); }
function Ur(t, ...e) { Yn.warn() && console.warn(`${lt.warn} ${t}`, ...e); }
function Xs(t, ...e) { console.info(`${lt.info} ${t}`, ...e); }
function Zs(t, ...e) { console.error(`${lt.error} ${t}`, ...e); }
function ea(t, ...e) { console.log(`${lt.query} ${t}`, ...e); }
u();
c();
m();
p();
d();
l();
function $t(t, e) { if (!t)
    throw new Error(`${e}. This should never happen. If you see this error, please, open an issue at https://pris.ly/prisma-prisma-bug-report`); }
u();
c();
m();
p();
d();
l();
function Ee(t, e) { throw new Error(e); }
u();
c();
m();
p();
d();
l();
function Nr(t, e) { return Object.prototype.hasOwnProperty.call(t, e); }
u();
c();
m();
p();
d();
l();
function $e(t, e) { let r = {}; for (let n of Object.keys(t))
    r[n] = e(t[n], n); return r; }
u();
c();
m();
p();
d();
l();
function qr(t, e) { if (t.length === 0)
    return; let r = t[0]; for (let n = 1; n < t.length; n++)
    e(r, t[n]) < 0 && (r = t[n]); return r; }
u();
c();
m();
p();
d();
l();
function re(t, e) { Object.defineProperty(t, "name", { value: e, configurable: !0 }); }
u();
c();
m();
p();
d();
l();
var ri = new Set, ct = (t, e, ...r) => { ri.has(t) || (ri.add(t), Ur(e, ...r)); };
var D = class t extends Error {
    constructor(e, r, n) { super(e), this.name = "PrismaClientInitializationError", this.clientVersion = r, this.errorCode = n, Error.captureStackTrace(t); }
    get [Symbol.toStringTag]() { return "PrismaClientInitializationError"; }
};
re(D, "PrismaClientInitializationError");
u();
c();
m();
p();
d();
l();
var Z = class extends Error {
    constructor(e, { code: r, clientVersion: n, meta: i, batchRequestIdx: o }) { super(e), this.name = "PrismaClientKnownRequestError", this.code = r, this.clientVersion = n, this.meta = i, Object.defineProperty(this, "batchRequestIdx", { value: o, enumerable: !1, writable: !0 }); }
    get [Symbol.toStringTag]() { return "PrismaClientKnownRequestError"; }
};
re(Z, "PrismaClientKnownRequestError");
u();
c();
m();
p();
d();
l();
var xe = class extends Error {
    constructor(e, r) { super(e), this.name = "PrismaClientRustPanicError", this.clientVersion = r; }
    get [Symbol.toStringTag]() { return "PrismaClientRustPanicError"; }
};
re(xe, "PrismaClientRustPanicError");
u();
c();
m();
p();
d();
l();
var Q = class extends Error {
    constructor(e, { clientVersion: r, batchRequestIdx: n }) { super(e), this.name = "PrismaClientUnknownRequestError", this.clientVersion = r, Object.defineProperty(this, "batchRequestIdx", { value: n, writable: !0, enumerable: !1 }); }
    get [Symbol.toStringTag]() { return "PrismaClientUnknownRequestError"; }
};
re(Q, "PrismaClientUnknownRequestError");
u();
c();
m();
p();
d();
l();
var K = class extends Error {
    constructor(e, { clientVersion: r }) {
        this.name = "PrismaClientValidationError";
        super(e), this.clientVersion = r;
    }
    get [Symbol.toStringTag]() { return "PrismaClientValidationError"; }
};
re(K, "PrismaClientValidationError");
u();
c();
m();
p();
d();
l();
l();
function Ve(t) { return t === null ? t : Array.isArray(t) ? t.map(Ve) : typeof t == "object" ? ra(t) ? na(t) : t.constructor !== null && t.constructor.name !== "Object" ? t : $e(t, Ve) : t; }
function ra(t) { return t !== null && typeof t == "object" && typeof t.$type == "string"; }
function na({ $type: t, value: e }) { switch (t) {
    case "BigInt": return BigInt(e);
    case "Bytes": {
        let { buffer: r, byteOffset: n, byteLength: i } = b.from(e, "base64");
        return new Uint8Array(r, n, i);
    }
    case "DateTime": return new Date(e);
    case "Decimal": return new pe(e);
    case "Json": return JSON.parse(e);
    default: Ee(e, "Unknown tagged value");
} }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var de = class {
    constructor() {
        this._map = new Map;
    }
    get(e) { return this._map.get(e)?.value; }
    set(e, r) { this._map.set(e, { value: r }); }
    getOrCreate(e, r) { let n = this._map.get(e); if (n)
        return n.value; let i = r(); return this.set(e, i), i; }
};
u();
c();
m();
p();
d();
l();
function Te(t) { return t.substring(0, 1).toLowerCase() + t.substring(1); }
u();
c();
m();
p();
d();
l();
function ii(t, e) { let r = {}; for (let n of t) {
    let i = n[e];
    r[i] = n;
} return r; }
u();
c();
m();
p();
d();
l();
function mt(t) { let e; return { get() { return e || (e = { value: t() }), e.value; } }; }
u();
c();
m();
p();
d();
l();
function oi(t) { return { models: Br(t.models), enums: Br(t.enums), types: Br(t.types) }; }
function Br(t) { let e = {}; for (let { name: r, ...n } of t)
    e[r] = n; return e; }
u();
c();
m();
p();
d();
l();
function je(t) { return t instanceof Date || Object.prototype.toString.call(t) === "[object Date]"; }
function Vt(t) { return t.toString() !== "Invalid Date"; }
u();
c();
m();
p();
d();
l();
l();
function Qe(t) { return T.isDecimal(t) ? !0 : t !== null && typeof t == "object" && typeof t.s == "number" && typeof t.e == "number" && typeof t.toFixed == "function" && Array.isArray(t.d); }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var dt = {};
it(dt, { ModelAction: () => pt, datamodelEnumToSchemaEnum: () => ia });
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
function ia(t) { return { name: t.name, values: t.values.map(e => e.name) }; }
u();
c();
m();
p();
d();
l();
var pt = (F => (F.findUnique = "findUnique", F.findUniqueOrThrow = "findUniqueOrThrow", F.findFirst = "findFirst", F.findFirstOrThrow = "findFirstOrThrow", F.findMany = "findMany", F.create = "create", F.createMany = "createMany", F.createManyAndReturn = "createManyAndReturn", F.update = "update", F.updateMany = "updateMany", F.updateManyAndReturn = "updateManyAndReturn", F.upsert = "upsert", F.delete = "delete", F.deleteMany = "deleteMany", F.groupBy = "groupBy", F.count = "count", F.aggregate = "aggregate", F.findRaw = "findRaw", F.aggregateRaw = "aggregateRaw", F))(pt || {});
var oa = ot(zn());
var sa = { red: qe, gray: Ln, dim: Ft, bold: Lt, underline: On, highlightSource: t => t.highlight() }, aa = { red: t => t, gray: t => t, dim: t => t, bold: t => t, underline: t => t, highlightSource: t => t };
function la({ message: t, originalMethod: e, isPanic: r, callArguments: n }) { return { functionName: `prisma.${e}()`, message: t, isPanic: r ?? !1, callArguments: n }; }
function ua({ functionName: t, location: e, message: r, isPanic: n, contextLines: i, callArguments: o }, s) {
    let a = [""], f = e ? " in" : ":";
    if (n ? (a.push(s.red(`Oops, an unknown error occurred! This is ${s.bold("on us")}, you did nothing wrong.`)), a.push(s.red(`It occurred in the ${s.bold(`\`${t}\``)} invocation${f}`))) : a.push(s.red(`Invalid ${s.bold(`\`${t}\``)} invocation${f}`)), e && a.push(s.underline(ca(e))), i) {
        a.push("");
        let y = [i.toString()];
        o && (y.push(o), y.push(s.dim(")"))), a.push(y.join("")), o && a.push("");
    }
    else
        a.push(""), o && a.push(o), a.push("");
    return a.push(r), a.join(`
`);
}
function ca(t) { let e = [t.fileName]; return t.lineNumber && e.push(String(t.lineNumber)), t.columnNumber && e.push(String(t.columnNumber)), e.join(":"); }
function jt(t) { let e = t.showColors ? sa : aa, r; return typeof $getTemplateParameters < "u" ? r = $getTemplateParameters(t, e) : r = la(t), ua(r, e); }
u();
c();
m();
p();
d();
l();
var fi = ot($r());
u();
c();
m();
p();
d();
l();
function ui(t, e, r) { let n = ci(t), i = ma(n), o = da(i); o ? Qt(o, e, r) : e.addErrorMessage(() => "Unknown error"); }
function ci(t) { return t.errors.flatMap(e => e.kind === "Union" ? ci(e) : [e]); }
function ma(t) { let e = new Map, r = []; for (let n of t) {
    if (n.kind !== "InvalidArgumentType") {
        r.push(n);
        continue;
    }
    let i = `${n.selectionPath.join(".")}:${n.argumentPath.join(".")}`, o = e.get(i);
    o ? e.set(i, { ...n, argument: { ...n.argument, typeNames: pa(o.argument.typeNames, n.argument.typeNames) } }) : e.set(i, n);
} return r.push(...e.values()), r; }
function pa(t, e) { return [...new Set(t.concat(e))]; }
function da(t) { return qr(t, (e, r) => { let n = ai(e), i = ai(r); return n !== i ? n - i : li(e) - li(r); }); }
function ai(t) { let e = 0; return Array.isArray(t.selectionPath) && (e += t.selectionPath.length), Array.isArray(t.argumentPath) && (e += t.argumentPath.length), e; }
function li(t) { switch (t.kind) {
    case "InvalidArgumentValue":
    case "ValueTooLarge": return 20;
    case "InvalidArgumentType": return 10;
    case "RequiredArgumentMissing": return -10;
    default: return 0;
} }
u();
c();
m();
p();
d();
l();
var ne = class {
    constructor(e, r) {
        this.isRequired = !1;
        this.name = e;
        this.value = r;
    }
    makeRequired() { return this.isRequired = !0, this; }
    write(e) { let { colors: { green: r } } = e.context; e.addMarginSymbol(r(this.isRequired ? "+" : "?")), e.write(r(this.name)), this.isRequired || e.write(r("?")), e.write(r(": ")), typeof this.value == "string" ? e.write(r(this.value)) : e.write(this.value); }
};
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
pi();
u();
c();
m();
p();
d();
l();
var Je = class {
    constructor(e = 0, r) {
        this.lines = [];
        this.currentLine = "";
        this.currentIndent = 0;
        this.context = r;
        this.currentIndent = e;
    }
    write(e) { return typeof e == "string" ? this.currentLine += e : e.write(this), this; }
    writeJoined(e, r, n = (i, o) => o.write(i)) { let i = r.length - 1; for (let o = 0; o < r.length; o++)
        n(r[o], this), o !== i && this.write(e); return this; }
    writeLine(e) { return this.write(e).newLine(); }
    newLine() { this.lines.push(this.indentedCurrentLine()), this.currentLine = "", this.marginSymbol = void 0; let e = this.afterNextNewLineCallback; return this.afterNextNewLineCallback = void 0, e?.(), this; }
    withIndent(e) { return this.indent(), e(this), this.unindent(), this; }
    afterNextNewline(e) { return this.afterNextNewLineCallback = e, this; }
    indent() { return this.currentIndent++, this; }
    unindent() { return this.currentIndent > 0 && this.currentIndent--, this; }
    addMarginSymbol(e) { return this.marginSymbol = e, this; }
    toString() {
        return this.lines.concat(this.indentedCurrentLine()).join(`
`);
    }
    getCurrentLineLength() { return this.currentLine.length; }
    indentedCurrentLine() { let e = this.currentLine.padStart(this.currentLine.length + 2 * this.currentIndent); return this.marginSymbol ? this.marginSymbol + e.slice(1) : e; }
};
mi();
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var Jt = class {
    constructor(e) { this.value = e; }
    write(e) { e.write(this.value); }
    markAsError() { this.value.markAsError(); }
};
u();
c();
m();
p();
d();
l();
var Gt = t => t, Wt = { bold: Gt, red: Gt, green: Gt, dim: Gt, enabled: !1 }, di = { bold: Lt, red: qe, green: In, dim: Ft, enabled: !0 }, Ge = { write(t) { t.writeLine(","); } };
u();
c();
m();
p();
d();
l();
var fe = class {
    constructor(e) {
        this.isUnderlined = !1;
        this.color = e => e;
        this.contents = e;
    }
    underline() { return this.isUnderlined = !0, this; }
    setColor(e) { return this.color = e, this; }
    write(e) { let r = e.getCurrentLineLength(); e.write(this.color(this.contents)), this.isUnderlined && e.afterNextNewline(() => { e.write(" ".repeat(r)).writeLine(this.color("~".repeat(this.contents.length))); }); }
};
u();
c();
m();
p();
d();
l();
var Ce = class {
    constructor() {
        this.hasError = !1;
    }
    markAsError() { return this.hasError = !0, this; }
};
var We = class extends Ce {
    constructor() {
        super(...arguments);
        this.items = [];
    }
    addItem(e) { return this.items.push(new Jt(e)), this; }
    getField(e) { return this.items[e]; }
    getPrintWidth() { return this.items.length === 0 ? 2 : Math.max(...this.items.map(r => r.value.getPrintWidth())) + 2; }
    write(e) { if (this.items.length === 0) {
        this.writeEmpty(e);
        return;
    } this.writeWithItems(e); }
    writeEmpty(e) { let r = new fe("[]"); this.hasError && r.setColor(e.context.colors.red).underline(), e.write(r); }
    writeWithItems(e) { let { colors: r } = e.context; e.writeLine("[").withIndent(() => e.writeJoined(Ge, this.items).newLine()).write("]"), this.hasError && e.afterNextNewline(() => { e.writeLine(r.red("~".repeat(this.getPrintWidth()))); }); }
    asObject() { }
};
var Ke = class t extends Ce {
    constructor() {
        super(...arguments);
        this.fields = {};
        this.suggestions = [];
    }
    addField(e) { this.fields[e.name] = e; }
    addSuggestion(e) { this.suggestions.push(e); }
    getField(e) { return this.fields[e]; }
    getDeepField(e) { let [r, ...n] = e, i = this.getField(r); if (!i)
        return; let o = i; for (let s of n) {
        let a;
        if (o.value instanceof t ? a = o.value.getField(s) : o.value instanceof We && (a = o.value.getField(Number(s))), !a)
            return;
        o = a;
    } return o; }
    getDeepFieldValue(e) { return e.length === 0 ? this : this.getDeepField(e)?.value; }
    hasField(e) { return !!this.getField(e); }
    removeAllFields() { this.fields = {}; }
    removeField(e) { delete this.fields[e]; }
    getFields() { return this.fields; }
    isEmpty() { return Object.keys(this.fields).length === 0; }
    getFieldValue(e) { return this.getField(e)?.value; }
    getDeepSubSelectionValue(e) { let r = this; for (let n of e) {
        if (!(r instanceof t))
            return;
        let i = r.getSubSelectionValue(n);
        if (!i)
            return;
        r = i;
    } return r; }
    getDeepSelectionParent(e) { let r = this.getSelectionParent(); if (!r)
        return; let n = r; for (let i of e) {
        let o = n.value.getFieldValue(i);
        if (!o || !(o instanceof t))
            return;
        let s = o.getSelectionParent();
        if (!s)
            return;
        n = s;
    } return n; }
    getSelectionParent() { let e = this.getField("select")?.value.asObject(); if (e)
        return { kind: "select", value: e }; let r = this.getField("include")?.value.asObject(); if (r)
        return { kind: "include", value: r }; }
    getSubSelectionValue(e) { return this.getSelectionParent()?.value.fields[e].value; }
    getPrintWidth() { let e = Object.values(this.fields); return e.length == 0 ? 2 : Math.max(...e.map(n => n.getPrintWidth())) + 2; }
    write(e) { let r = Object.values(this.fields); if (r.length === 0 && this.suggestions.length === 0) {
        this.writeEmpty(e);
        return;
    } this.writeWithContents(e, r); }
    asObject() { return this; }
    writeEmpty(e) { let r = new fe("{}"); this.hasError && r.setColor(e.context.colors.red).underline(), e.write(r); }
    writeWithContents(e, r) { e.writeLine("{").withIndent(() => { e.writeJoined(Ge, [...r, ...this.suggestions]).newLine(); }), e.write("}"), this.hasError && e.afterNextNewline(() => { e.writeLine(e.context.colors.red("~".repeat(this.getPrintWidth()))); }); }
};
u();
c();
m();
p();
d();
l();
var W = class extends Ce {
    constructor(r) { super(); this.text = r; }
    getPrintWidth() { return this.text.length; }
    write(r) { let n = new fe(this.text); this.hasError && n.underline().setColor(r.context.colors.red), r.write(n); }
    asObject() { }
};
u();
c();
m();
p();
d();
l();
var ft = class {
    constructor() {
        this.fields = [];
    }
    addField(e, r) { return this.fields.push({ write(n) { let { green: i, dim: o } = n.context.colors; n.write(i(o(`${e}: ${r}`))).addMarginSymbol(i(o("+"))); } }), this; }
    write(e) { let { colors: { green: r } } = e.context; e.writeLine(r("{")).withIndent(() => { e.writeJoined(Ge, this.fields).newLine(); }).write(r("}")).addMarginSymbol(r("+")); }
};
function Qt(t, e, r) { switch (t.kind) {
    case "MutuallyExclusiveFields":
        fa(t, e);
        break;
    case "IncludeOnScalar":
        ga(t, e);
        break;
    case "EmptySelection":
        ya(t, e, r);
        break;
    case "UnknownSelectionField":
        Ea(t, e);
        break;
    case "InvalidSelectionValue":
        xa(t, e);
        break;
    case "UnknownArgument":
        Pa(t, e);
        break;
    case "UnknownInputField":
        va(t, e);
        break;
    case "RequiredArgumentMissing":
        Ta(t, e);
        break;
    case "InvalidArgumentType":
        Ca(t, e);
        break;
    case "InvalidArgumentValue":
        Ra(t, e);
        break;
    case "ValueTooLarge":
        Aa(t, e);
        break;
    case "SomeFieldsMissing":
        Sa(t, e);
        break;
    case "TooManyFieldsGiven":
        ka(t, e);
        break;
    case "Union":
        ui(t, e, r);
        break;
    default: throw new Error("not implemented: " + t.kind);
} }
function fa(t, e) { let r = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(); r && (r.getField(t.firstField)?.markAsError(), r.getField(t.secondField)?.markAsError()), e.addErrorMessage(n => `Please ${n.bold("either")} use ${n.green(`\`${t.firstField}\``)} or ${n.green(`\`${t.secondField}\``)}, but ${n.red("not both")} at the same time.`); }
function ga(t, e) {
    let [r, n] = He(t.selectionPath), i = t.outputType, o = e.arguments.getDeepSelectionParent(r)?.value;
    if (o && (o.getField(n)?.markAsError(), i))
        for (let s of i.fields)
            s.isRelation && o.addSuggestion(new ne(s.name, "true"));
    e.addErrorMessage(s => {
        let a = `Invalid scalar field ${s.red(`\`${n}\``)} for ${s.bold("include")} statement`;
        return i ? a += ` on model ${s.bold(i.name)}. ${gt(s)}` : a += ".", a += `
Note that ${s.bold("include")} statements only accept relation fields.`, a;
    });
}
function ya(t, e, r) { let n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(); if (n) {
    let i = n.getField("omit")?.value.asObject();
    if (i) {
        ha(t, e, i);
        return;
    }
    if (n.hasField("select")) {
        ba(t, e);
        return;
    }
} if (r?.[Te(t.outputType.name)]) {
    wa(t, e);
    return;
} e.addErrorMessage(() => `Unknown field at "${t.selectionPath.join(".")} selection"`); }
function ha(t, e, r) { r.removeAllFields(); for (let n of t.outputType.fields)
    r.addSuggestion(new ne(n.name, "false")); e.addErrorMessage(n => `The ${n.red("omit")} statement includes every field of the model ${n.bold(t.outputType.name)}. At least one field must be included in the result`); }
function ba(t, e) { let r = t.outputType, n = e.arguments.getDeepSelectionParent(t.selectionPath)?.value, i = n?.isEmpty() ?? !1; n && (n.removeAllFields(), hi(n, r)), e.addErrorMessage(o => i ? `The ${o.red("`select`")} statement for type ${o.bold(r.name)} must not be empty. ${gt(o)}` : `The ${o.red("`select`")} statement for type ${o.bold(r.name)} needs ${o.bold("at least one truthy value")}.`); }
function wa(t, e) { let r = new ft; for (let i of t.outputType.fields)
    i.isRelation || r.addField(i.name, "false"); let n = new ne("omit", r).makeRequired(); if (t.selectionPath.length === 0)
    e.arguments.addSuggestion(n);
else {
    let [i, o] = He(t.selectionPath), a = e.arguments.getDeepSelectionParent(i)?.value.asObject()?.getField(o);
    if (a) {
        let f = a?.value.asObject() ?? new Ke;
        f.addSuggestion(n), a.value = f;
    }
} e.addErrorMessage(i => `The global ${i.red("omit")} configuration excludes every field of the model ${i.bold(t.outputType.name)}. At least one field must be included in the result`); }
function Ea(t, e) { let r = bi(t.selectionPath, e); if (r.parentKind !== "unknown") {
    r.field.markAsError();
    let n = r.parent;
    switch (r.parentKind) {
        case "select":
            hi(n, t.outputType);
            break;
        case "include":
            Oa(n, t.outputType);
            break;
        case "omit":
            Ia(n, t.outputType);
            break;
    }
} e.addErrorMessage(n => { let i = [`Unknown field ${n.red(`\`${r.fieldName}\``)}`]; return r.parentKind !== "unknown" && i.push(`for ${n.bold(r.parentKind)} statement`), i.push(`on model ${n.bold(`\`${t.outputType.name}\``)}.`), i.push(gt(n)), i.join(" "); }); }
function xa(t, e) { let r = bi(t.selectionPath, e); r.parentKind !== "unknown" && r.field.value.markAsError(), e.addErrorMessage(n => `Invalid value for selection field \`${n.red(r.fieldName)}\`: ${t.underlyingError}`); }
function Pa(t, e) { let r = t.argumentPath[0], n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(); n && (n.getField(r)?.markAsError(), Ma(n, t.arguments)), e.addErrorMessage(i => gi(i, r, t.arguments.map(o => o.name))); }
function va(t, e) { let [r, n] = He(t.argumentPath), i = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(); if (i) {
    i.getDeepField(t.argumentPath)?.markAsError();
    let o = i.getDeepFieldValue(r)?.asObject();
    o && wi(o, t.inputType);
} e.addErrorMessage(o => gi(o, n, t.inputType.fields.map(s => s.name))); }
function gi(t, e, r) { let n = [`Unknown argument \`${t.red(e)}\`.`], i = _a(e, r); return i && n.push(`Did you mean \`${t.green(i)}\`?`), r.length > 0 && n.push(gt(t)), n.join(" "); }
function Ta(t, e) { let r; e.addErrorMessage(f => r?.value instanceof W && r.value.text === "null" ? `Argument \`${f.green(o)}\` must not be ${f.red("null")}.` : `Argument \`${f.green(o)}\` is missing.`); let n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(); if (!n)
    return; let [i, o] = He(t.argumentPath), s = new ft, a = n.getDeepFieldValue(i)?.asObject(); if (a) {
    if (r = a.getField(o), r && a.removeField(o), t.inputTypes.length === 1 && t.inputTypes[0].kind === "object") {
        for (let f of t.inputTypes[0].fields)
            s.addField(f.name, f.typeNames.join(" | "));
        a.addSuggestion(new ne(o, s).makeRequired());
    }
    else {
        let f = t.inputTypes.map(yi).join(" | ");
        a.addSuggestion(new ne(o, f).makeRequired());
    }
    if (t.dependentArgumentPath) {
        n.getDeepField(t.dependentArgumentPath)?.markAsError();
        let [, f] = He(t.dependentArgumentPath);
        e.addErrorMessage(y => `Argument \`${y.green(o)}\` is required because argument \`${y.green(f)}\` was provided.`);
    }
} }
function yi(t) { return t.kind === "list" ? `${yi(t.elementType)}[]` : t.name; }
function Ca(t, e) { let r = t.argument.name, n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(); n && n.getDeepFieldValue(t.argumentPath)?.markAsError(), e.addErrorMessage(i => { let o = Kt("or", t.argument.typeNames.map(s => i.green(s))); return `Argument \`${i.bold(r)}\`: Invalid value provided. Expected ${o}, provided ${i.red(t.inferredType)}.`; }); }
function Ra(t, e) { let r = t.argument.name, n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(); n && n.getDeepFieldValue(t.argumentPath)?.markAsError(), e.addErrorMessage(i => { let o = [`Invalid value for argument \`${i.bold(r)}\``]; if (t.underlyingError && o.push(`: ${t.underlyingError}`), o.push("."), t.argument.typeNames.length > 0) {
    let s = Kt("or", t.argument.typeNames.map(a => i.green(a)));
    o.push(` Expected ${s}.`);
} return o.join(""); }); }
function Aa(t, e) { let r = t.argument.name, n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(), i; if (n) {
    let s = n.getDeepField(t.argumentPath)?.value;
    s?.markAsError(), s instanceof W && (i = s.text);
} e.addErrorMessage(o => { let s = ["Unable to fit value"]; return i && s.push(o.red(i)), s.push(`into a 64-bit signed integer for field \`${o.bold(r)}\``), s.join(" "); }); }
function Sa(t, e) { let r = t.argumentPath[t.argumentPath.length - 1], n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(); if (n) {
    let i = n.getDeepFieldValue(t.argumentPath)?.asObject();
    i && wi(i, t.inputType);
} e.addErrorMessage(i => { let o = [`Argument \`${i.bold(r)}\` of type ${i.bold(t.inputType.name)} needs`]; return t.constraints.minFieldCount === 1 ? t.constraints.requiredFields ? o.push(`${i.green("at least one of")} ${Kt("or", t.constraints.requiredFields.map(s => `\`${i.bold(s)}\``))} arguments.`) : o.push(`${i.green("at least one")} argument.`) : o.push(`${i.green(`at least ${t.constraints.minFieldCount}`)} arguments.`), o.push(gt(i)), o.join(" "); }); }
function ka(t, e) { let r = t.argumentPath[t.argumentPath.length - 1], n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(), i = []; if (n) {
    let o = n.getDeepFieldValue(t.argumentPath)?.asObject();
    o && (o.markAsError(), i = Object.keys(o.getFields()));
} e.addErrorMessage(o => { let s = [`Argument \`${o.bold(r)}\` of type ${o.bold(t.inputType.name)} needs`]; return t.constraints.minFieldCount === 1 && t.constraints.maxFieldCount == 1 ? s.push(`${o.green("exactly one")} argument,`) : t.constraints.maxFieldCount == 1 ? s.push(`${o.green("at most one")} argument,`) : s.push(`${o.green(`at most ${t.constraints.maxFieldCount}`)} arguments,`), s.push(`but you provided ${Kt("and", i.map(a => o.red(a)))}. Please choose`), t.constraints.maxFieldCount === 1 ? s.push("one.") : s.push(`${t.constraints.maxFieldCount}.`), s.join(" "); }); }
function hi(t, e) { for (let r of e.fields)
    t.hasField(r.name) || t.addSuggestion(new ne(r.name, "true")); }
function Oa(t, e) { for (let r of e.fields)
    r.isRelation && !t.hasField(r.name) && t.addSuggestion(new ne(r.name, "true")); }
function Ia(t, e) { for (let r of e.fields)
    !t.hasField(r.name) && !r.isRelation && t.addSuggestion(new ne(r.name, "true")); }
function Ma(t, e) { for (let r of e)
    t.hasField(r.name) || t.addSuggestion(new ne(r.name, r.typeNames.join(" | "))); }
function bi(t, e) { let [r, n] = He(t), i = e.arguments.getDeepSubSelectionValue(r)?.asObject(); if (!i)
    return { parentKind: "unknown", fieldName: n }; let o = i.getFieldValue("select")?.asObject(), s = i.getFieldValue("include")?.asObject(), a = i.getFieldValue("omit")?.asObject(), f = o?.getField(n); return o && f ? { parentKind: "select", parent: o, field: f, fieldName: n } : (f = s?.getField(n), s && f ? { parentKind: "include", field: f, parent: s, fieldName: n } : (f = a?.getField(n), a && f ? { parentKind: "omit", field: f, parent: a, fieldName: n } : { parentKind: "unknown", fieldName: n })); }
function wi(t, e) { if (e.kind === "object")
    for (let r of e.fields)
        t.hasField(r.name) || t.addSuggestion(new ne(r.name, r.typeNames.join(" | "))); }
function He(t) { let e = [...t], r = e.pop(); if (!r)
    throw new Error("unexpected empty path"); return [e, r]; }
function gt({ green: t, enabled: e }) { return "Available options are " + (e ? `listed in ${t("green")}` : "marked with ?") + "."; }
function Kt(t, e) { if (e.length === 1)
    return e[0]; let r = [...e], n = r.pop(); return `${r.join(", ")} ${t} ${n}`; }
var Da = 3;
function _a(t, e) { let r = 1 / 0, n; for (let i of e) {
    let o = (0, fi.default)(t, i);
    o > Da || o < r && (r = o, n = i);
} return n; }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var yt = class {
    constructor(e, r, n, i, o) { this.modelName = e, this.name = r, this.typeName = n, this.isList = i, this.isEnum = o; }
    _toGraphQLInputType() { let e = this.isList ? "List" : "", r = this.isEnum ? "Enum" : ""; return `${e}${r}${this.typeName}FieldRefInput<${this.modelName}>`; }
};
function ze(t) { return t instanceof yt; }
u();
c();
m();
p();
d();
l();
var Ht = Symbol(), jr = new WeakMap, Pe = class {
    constructor(e) { e === Ht ? jr.set(this, `Prisma.${this._getName()}`) : jr.set(this, `new Prisma.${this._getNamespace()}.${this._getName()}()`); }
    _getName() { return this.constructor.name; }
    toString() { return jr.get(this); }
}, ht = class extends Pe {
    _getNamespace() { return "NullTypes"; }
}, bt = (_b = class extends ht {
        constructor() {
            super(...arguments);
            _bt_e.set(this, void 0);
        }
    },
    _bt_e = new WeakMap(),
    _b);
Qr(bt, "DbNull");
var wt = (_c = class extends ht {
        constructor() {
            super(...arguments);
            _wt_e.set(this, void 0);
        }
    },
    _wt_e = new WeakMap(),
    _c);
Qr(wt, "JsonNull");
var Et = (_d = class extends ht {
        constructor() {
            super(...arguments);
            _Et_e.set(this, void 0);
        }
    },
    _Et_e = new WeakMap(),
    _d);
Qr(Et, "AnyNull");
var zt = { classes: { DbNull: bt, JsonNull: wt, AnyNull: Et }, instances: { DbNull: new bt(Ht), JsonNull: new wt(Ht), AnyNull: new Et(Ht) } };
function Qr(t, e) { Object.defineProperty(t, "name", { value: e, configurable: !0 }); }
u();
c();
m();
p();
d();
l();
var Ei = ": ", Yt = class {
    constructor(e, r) {
        this.hasError = !1;
        this.name = e;
        this.value = r;
    }
    markAsError() { this.hasError = !0; }
    getPrintWidth() { return this.name.length + this.value.getPrintWidth() + Ei.length; }
    write(e) { let r = new fe(this.name); this.hasError && r.underline().setColor(e.context.colors.red), e.write(r).write(Ei).write(this.value); }
};
var Jr = class {
    constructor(e) {
        this.errorMessages = [];
        this.arguments = e;
    }
    write(e) { e.write(this.arguments); }
    addErrorMessage(e) { this.errorMessages.push(e); }
    renderAllMessages(e) {
        return this.errorMessages.map(r => r(e)).join(`
`);
    }
};
function Ye(t) { return new Jr(xi(t)); }
function xi(t) { let e = new Ke; for (let [r, n] of Object.entries(t)) {
    let i = new Yt(r, Pi(n));
    e.addField(i);
} return e; }
function Pi(t) { if (typeof t == "string")
    return new W(JSON.stringify(t)); if (typeof t == "number" || typeof t == "boolean")
    return new W(String(t)); if (typeof t == "bigint")
    return new W(`${t}n`); if (t === null)
    return new W("null"); if (t === void 0)
    return new W("undefined"); if (Qe(t))
    return new W(`new Prisma.Decimal("${t.toFixed()}")`); if (t instanceof Uint8Array)
    return b.isBuffer(t) ? new W(`Buffer.alloc(${t.byteLength})`) : new W(`new Uint8Array(${t.byteLength})`); if (t instanceof Date) {
    let e = Vt(t) ? t.toISOString() : "Invalid Date";
    return new W(`new Date("${e}")`);
} return t instanceof Pe ? new W(`Prisma.${t._getName()}`) : ze(t) ? new W(`prisma.${Te(t.modelName)}.$fields.${t.name}`) : Array.isArray(t) ? La(t) : typeof t == "object" ? xi(t) : new W(Object.prototype.toString.call(t)); }
function La(t) { let e = new We; for (let r of t)
    e.addItem(Pi(r)); return e; }
function Xt(t, e) { let r = e === "pretty" ? di : Wt, n = t.renderAllMessages(r), i = new Je(0, { colors: r }).write(t).toString(); return { message: n, args: i }; }
function Zt({ args: t, errors: e, errorFormat: r, callsite: n, originalMethod: i, clientVersion: o, globalOmit: s }) { let a = Ye(t); for (let R of e)
    Qt(R, a, s); let { message: f, args: y } = Xt(a, r), C = jt({ message: f, callsite: n, originalMethod: i, showColors: r === "pretty", callArguments: y }); throw new K(C, { clientVersion: o }); }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
function ge(t) { return t.replace(/^./, e => e.toLowerCase()); }
u();
c();
m();
p();
d();
l();
function Ti(t, e, r) { let n = ge(r); return !e.result || !(e.result.$allModels || e.result[n]) ? t : Fa({ ...t, ...vi(e.name, t, e.result.$allModels), ...vi(e.name, t, e.result[n]) }); }
function Fa(t) { let e = new de, r = (n, i) => e.getOrCreate(n, () => i.has(n) ? [n] : (i.add(n), t[n] ? t[n].needs.flatMap(o => r(o, i)) : [n])); return $e(t, n => ({ ...n, needs: r(n.name, new Set) })); }
function vi(t, e, r) { return r ? $e(r, ({ needs: n, compute: i }, o) => ({ name: o, needs: n ? Object.keys(n).filter(s => n[s]) : [], compute: Ua(e, o, i) })) : {}; }
function Ua(t, e, r) { let n = t?.[e]?.compute; return n ? i => r({ ...i, [e]: n(i) }) : r; }
function Ci(t, e) { if (!e)
    return t; let r = { ...t }; for (let n of Object.values(e))
    if (t[n.name])
        for (let i of n.needs)
            r[i] = !0; return r; }
function Ri(t, e) { if (!e)
    return t; let r = { ...t }; for (let n of Object.values(e))
    if (!t[n.name])
        for (let i of n.needs)
            delete r[i]; return r; }
var er = class {
    constructor(e, r) {
        this.computedFieldsCache = new de;
        this.modelExtensionsCache = new de;
        this.queryCallbacksCache = new de;
        this.clientExtensions = mt(() => this.extension.client ? { ...this.previous?.getAllClientExtensions(), ...this.extension.client } : this.previous?.getAllClientExtensions());
        this.batchCallbacks = mt(() => { let e = this.previous?.getAllBatchQueryCallbacks() ?? [], r = this.extension.query?.$__internalBatch; return r ? e.concat(r) : e; });
        this.extension = e;
        this.previous = r;
    }
    getAllComputedFields(e) { return this.computedFieldsCache.getOrCreate(e, () => Ti(this.previous?.getAllComputedFields(e), this.extension, e)); }
    getAllClientExtensions() { return this.clientExtensions.get(); }
    getAllModelExtensions(e) { return this.modelExtensionsCache.getOrCreate(e, () => { let r = ge(e); return !this.extension.model || !(this.extension.model[r] || this.extension.model.$allModels) ? this.previous?.getAllModelExtensions(e) : { ...this.previous?.getAllModelExtensions(e), ...this.extension.model.$allModels, ...this.extension.model[r] }; }); }
    getAllQueryCallbacks(e, r) { return this.queryCallbacksCache.getOrCreate(`${e}:${r}`, () => { let n = this.previous?.getAllQueryCallbacks(e, r) ?? [], i = [], o = this.extension.query; return !o || !(o[e] || o.$allModels || o[r] || o.$allOperations) ? n : (o[e] !== void 0 && (o[e][r] !== void 0 && i.push(o[e][r]), o[e].$allOperations !== void 0 && i.push(o[e].$allOperations)), e !== "$none" && o.$allModels !== void 0 && (o.$allModels[r] !== void 0 && i.push(o.$allModels[r]), o.$allModels.$allOperations !== void 0 && i.push(o.$allModels.$allOperations)), o[r] !== void 0 && i.push(o[r]), o.$allOperations !== void 0 && i.push(o.$allOperations), n.concat(i)); }); }
    getAllBatchQueryCallbacks() { return this.batchCallbacks.get(); }
}, Xe = class t {
    constructor(e) { this.head = e; }
    static empty() { return new t; }
    static single(e) { return new t(new er(e)); }
    isEmpty() { return this.head === void 0; }
    append(e) { return new t(new er(e, this.head)); }
    getAllComputedFields(e) { return this.head?.getAllComputedFields(e); }
    getAllClientExtensions() { return this.head?.getAllClientExtensions(); }
    getAllModelExtensions(e) { return this.head?.getAllModelExtensions(e); }
    getAllQueryCallbacks(e, r) { return this.head?.getAllQueryCallbacks(e, r) ?? []; }
    getAllBatchQueryCallbacks() { return this.head?.getAllBatchQueryCallbacks() ?? []; }
};
u();
c();
m();
p();
d();
l();
var tr = class {
    constructor(e) { this.name = e; }
};
function Ai(t) { return t instanceof tr; }
function Si(t) { return new tr(t); }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var ki = Symbol(), xt = class {
    constructor(e) { if (e !== ki)
        throw new Error("Skip instance can not be constructed directly"); }
    ifUndefined(e) { return e === void 0 ? rr : e; }
}, rr = new xt(ki);
function ye(t) { return t instanceof xt; }
var Na = { findUnique: "findUnique", findUniqueOrThrow: "findUniqueOrThrow", findFirst: "findFirst", findFirstOrThrow: "findFirstOrThrow", findMany: "findMany", count: "aggregate", create: "createOne", createMany: "createMany", createManyAndReturn: "createManyAndReturn", update: "updateOne", updateMany: "updateMany", updateManyAndReturn: "updateManyAndReturn", upsert: "upsertOne", delete: "deleteOne", deleteMany: "deleteMany", executeRaw: "executeRaw", queryRaw: "queryRaw", aggregate: "aggregate", groupBy: "groupBy", runCommandRaw: "runCommandRaw", findRaw: "findRaw", aggregateRaw: "aggregateRaw" }, Oi = "explicitly `undefined` values are not allowed";
function nr({ modelName: t, action: e, args: r, runtimeDataModel: n, extensions: i = Xe.empty(), callsite: o, clientMethod: s, errorFormat: a, clientVersion: f, previewFeatures: y, globalOmit: C }) { let R = new Gr({ runtimeDataModel: n, modelName: t, action: e, rootArgs: r, callsite: o, extensions: i, selectionPath: [], argumentPath: [], originalMethod: s, errorFormat: a, clientVersion: f, previewFeatures: y, globalOmit: C }); return { modelName: t, action: Na[e], query: Pt(r, R) }; }
function Pt({ select: t, include: e, ...r } = {}, n) { let i = r.omit; return delete r.omit, { arguments: Mi(r, n), selection: qa(t, e, i, n) }; }
function qa(t, e, r, n) { return t ? (e ? n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "include", secondField: "select", selectionPath: n.getSelectionPath() }) : r && n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "omit", secondField: "select", selectionPath: n.getSelectionPath() }), ja(t, n)) : Ba(n, e, r); }
function Ba(t, e, r) { let n = {}; return t.modelOrType && !t.isRawAction() && (n.$composites = !0, n.$scalars = !0), e && $a(n, e, t), Va(n, r, t), n; }
function $a(t, e, r) { for (let [n, i] of Object.entries(e)) {
    if (ye(i))
        continue;
    let o = r.nestSelection(n);
    if (Wr(i, o), i === !1 || i === void 0) {
        t[n] = !1;
        continue;
    }
    let s = r.findField(n);
    if (s && s.kind !== "object" && r.throwValidationError({ kind: "IncludeOnScalar", selectionPath: r.getSelectionPath().concat(n), outputType: r.getOutputTypeDescription() }), s) {
        t[n] = Pt(i === !0 ? {} : i, o);
        continue;
    }
    if (i === !0) {
        t[n] = !0;
        continue;
    }
    t[n] = Pt(i, o);
} }
function Va(t, e, r) { let n = r.getComputedFields(), i = { ...r.getGlobalOmit(), ...e }, o = Ri(i, n); for (let [s, a] of Object.entries(o)) {
    if (ye(a))
        continue;
    Wr(a, r.nestSelection(s));
    let f = r.findField(s);
    n?.[s] && !f || (t[s] = !a);
} }
function ja(t, e) { let r = {}, n = e.getComputedFields(), i = Ci(t, n); for (let [o, s] of Object.entries(i)) {
    if (ye(s))
        continue;
    let a = e.nestSelection(o);
    Wr(s, a);
    let f = e.findField(o);
    if (!(n?.[o] && !f)) {
        if (s === !1 || s === void 0 || ye(s)) {
            r[o] = !1;
            continue;
        }
        if (s === !0) {
            f?.kind === "object" ? r[o] = Pt({}, a) : r[o] = !0;
            continue;
        }
        r[o] = Pt(s, a);
    }
} return r; }
function Ii(t, e) { if (t === null)
    return null; if (typeof t == "string" || typeof t == "number" || typeof t == "boolean")
    return t; if (typeof t == "bigint")
    return { $type: "BigInt", value: String(t) }; if (je(t)) {
    if (Vt(t))
        return { $type: "DateTime", value: t.toISOString() };
    e.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: e.getSelectionPath(), argumentPath: e.getArgumentPath(), argument: { name: e.getArgumentName(), typeNames: ["Date"] }, underlyingError: "Provided Date object is invalid" });
} if (Ai(t))
    return { $type: "Param", value: t.name }; if (ze(t))
    return { $type: "FieldRef", value: { _ref: t.name, _container: t.modelName } }; if (Array.isArray(t))
    return Qa(t, e); if (ArrayBuffer.isView(t)) {
    let { buffer: r, byteOffset: n, byteLength: i } = t;
    return { $type: "Bytes", value: b.from(r, n, i).toString("base64") };
} if (Ja(t))
    return t.values; if (Qe(t))
    return { $type: "Decimal", value: t.toFixed() }; if (t instanceof Pe) {
    if (t !== zt.instances[t._getName()])
        throw new Error("Invalid ObjectEnumValue");
    return { $type: "Enum", value: t._getName() };
} if (Ga(t))
    return t.toJSON(); if (typeof t == "object")
    return Mi(t, e); e.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: e.getSelectionPath(), argumentPath: e.getArgumentPath(), argument: { name: e.getArgumentName(), typeNames: [] }, underlyingError: `We could not serialize ${Object.prototype.toString.call(t)} value. Serialize the object to JSON or implement a ".toJSON()" method on it` }); }
function Mi(t, e) { if (t.$type)
    return { $type: "Raw", value: t }; let r = {}; for (let n in t) {
    let i = t[n], o = e.nestArgument(n);
    ye(i) || (i !== void 0 ? r[n] = Ii(i, o) : e.isPreviewFeatureOn("strictUndefinedChecks") && e.throwValidationError({ kind: "InvalidArgumentValue", argumentPath: o.getArgumentPath(), selectionPath: e.getSelectionPath(), argument: { name: e.getArgumentName(), typeNames: [] }, underlyingError: Oi }));
} return r; }
function Qa(t, e) { let r = []; for (let n = 0; n < t.length; n++) {
    let i = e.nestArgument(String(n)), o = t[n];
    if (o === void 0 || ye(o)) {
        let s = o === void 0 ? "undefined" : "Prisma.skip";
        e.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: i.getSelectionPath(), argumentPath: i.getArgumentPath(), argument: { name: `${e.getArgumentName()}[${n}]`, typeNames: [] }, underlyingError: `Can not use \`${s}\` value within array. Use \`null\` or filter out \`${s}\` values` });
    }
    r.push(Ii(o, i));
} return r; }
function Ja(t) { return typeof t == "object" && t !== null && t.__prismaRawParameters__ === !0; }
function Ga(t) { return typeof t == "object" && t !== null && typeof t.toJSON == "function"; }
function Wr(t, e) { t === void 0 && e.isPreviewFeatureOn("strictUndefinedChecks") && e.throwValidationError({ kind: "InvalidSelectionValue", selectionPath: e.getSelectionPath(), underlyingError: Oi }); }
var Gr = class t {
    constructor(e) { this.params = e; this.params.modelName && (this.modelOrType = this.params.runtimeDataModel.models[this.params.modelName] ?? this.params.runtimeDataModel.types[this.params.modelName]); }
    throwValidationError(e) { Zt({ errors: [e], originalMethod: this.params.originalMethod, args: this.params.rootArgs ?? {}, callsite: this.params.callsite, errorFormat: this.params.errorFormat, clientVersion: this.params.clientVersion, globalOmit: this.params.globalOmit }); }
    getSelectionPath() { return this.params.selectionPath; }
    getArgumentPath() { return this.params.argumentPath; }
    getArgumentName() { return this.params.argumentPath[this.params.argumentPath.length - 1]; }
    getOutputTypeDescription() { if (!(!this.params.modelName || !this.modelOrType))
        return { name: this.params.modelName, fields: this.modelOrType.fields.map(e => ({ name: e.name, typeName: "boolean", isRelation: e.kind === "object" })) }; }
    isRawAction() { return ["executeRaw", "queryRaw", "runCommandRaw", "findRaw", "aggregateRaw"].includes(this.params.action); }
    isPreviewFeatureOn(e) { return this.params.previewFeatures.includes(e); }
    getComputedFields() { if (this.params.modelName)
        return this.params.extensions.getAllComputedFields(this.params.modelName); }
    findField(e) { return this.modelOrType?.fields.find(r => r.name === e); }
    nestSelection(e) { let r = this.findField(e), n = r?.kind === "object" ? r.type : void 0; return new t({ ...this.params, modelName: n, selectionPath: this.params.selectionPath.concat(e) }); }
    getGlobalOmit() { return this.params.modelName && this.shouldApplyGlobalOmit() ? this.params.globalOmit?.[Te(this.params.modelName)] ?? {} : {}; }
    shouldApplyGlobalOmit() { switch (this.params.action) {
        case "findFirst":
        case "findFirstOrThrow":
        case "findUniqueOrThrow":
        case "findMany":
        case "upsert":
        case "findUnique":
        case "createManyAndReturn":
        case "create":
        case "update":
        case "updateManyAndReturn":
        case "delete": return !0;
        case "executeRaw":
        case "aggregateRaw":
        case "runCommandRaw":
        case "findRaw":
        case "createMany":
        case "deleteMany":
        case "groupBy":
        case "updateMany":
        case "count":
        case "aggregate":
        case "queryRaw": return !1;
        default: Ee(this.params.action, "Unknown action");
    } }
    nestArgument(e) { return new t({ ...this.params, argumentPath: this.params.argumentPath.concat(e) }); }
};
u();
c();
m();
p();
d();
l();
function Di(t) { if (!t._hasPreviewFlag("metrics"))
    throw new K("`metrics` preview feature must be enabled in order to access metrics API", { clientVersion: t._clientVersion }); }
var Ze = class {
    constructor(e) { this._client = e; }
    prometheus(e) { return Di(this._client), this._client._engine.metrics({ format: "prometheus", ...e }); }
    json(e) { return Di(this._client), this._client._engine.metrics({ format: "json", ...e }); }
};
u();
c();
m();
p();
d();
l();
function _i(t, e) { let r = mt(() => Wa(e)); Object.defineProperty(t, "dmmf", { get: () => r.get() }); }
function Wa(t) { throw new Error("Prisma.dmmf is not available when running in edge runtimes."); }
function Kr(t) { return Object.entries(t).map(([e, r]) => ({ name: e, ...r })); }
u();
c();
m();
p();
d();
l();
var Hr = new WeakMap, ir = "$$PrismaTypedSql", vt = class {
    constructor(e, r) { Hr.set(this, { sql: e, values: r }), Object.defineProperty(this, ir, { value: ir }); }
    get sql() { return Hr.get(this).sql; }
    get values() { return Hr.get(this).values; }
};
function Li(t) { return (...e) => new vt(t, e); }
function or(t) { return t != null && t[ir] === ir; }
u();
c();
m();
p();
d();
l();
var Wo = ot(Fi());
u();
c();
m();
p();
d();
l();
Ui();
Bn();
Qn();
u();
c();
m();
p();
d();
l();
var ee = class t {
    constructor(e, r) { if (e.length - 1 !== r.length)
        throw e.length === 0 ? new TypeError("Expected at least 1 string") : new TypeError(`Expected ${e.length} strings to have ${e.length - 1} values`); let n = r.reduce((s, a) => s + (a instanceof t ? a.values.length : 1), 0); this.values = new Array(n), this.strings = new Array(n + 1), this.strings[0] = e[0]; let i = 0, o = 0; for (; i < r.length;) {
        let s = r[i++], a = e[i];
        if (s instanceof t) {
            this.strings[o] += s.strings[0];
            let f = 0;
            for (; f < s.values.length;)
                this.values[o++] = s.values[f++], this.strings[o] = s.strings[f];
            this.strings[o] += a;
        }
        else
            this.values[o++] = s, this.strings[o] = a;
    } }
    get sql() { let e = this.strings.length, r = 1, n = this.strings[0]; for (; r < e;)
        n += `?${this.strings[r++]}`; return n; }
    get statement() { let e = this.strings.length, r = 1, n = this.strings[0]; for (; r < e;)
        n += `:${r}${this.strings[r++]}`; return n; }
    get text() { let e = this.strings.length, r = 1, n = this.strings[0]; for (; r < e;)
        n += `$${r}${this.strings[r++]}`; return n; }
    inspect() { return { sql: this.sql, statement: this.statement, text: this.text, values: this.values }; }
};
function Ni(t, e = ",", r = "", n = "") { if (t.length === 0)
    throw new TypeError("Expected `join([])` to be called with an array of multiple elements, but got an empty array"); return new ee([r, ...Array(t.length - 1).fill(e), n], t); }
function zr(t) { return new ee([t], []); }
var qi = zr("");
function Yr(t, ...e) { return new ee(t, e); }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
function Tt(t) { return { getKeys() { return Object.keys(t); }, getPropertyValue(e) { return t[e]; } }; }
u();
c();
m();
p();
d();
l();
function H(t, e) { return { getKeys() { return [t]; }, getPropertyValue() { return e(); } }; }
u();
c();
m();
p();
d();
l();
function _e(t) { let e = new de; return { getKeys() { return t.getKeys(); }, getPropertyValue(r) { return e.getOrCreate(r, () => t.getPropertyValue(r)); }, getPropertyDescriptor(r) { return t.getPropertyDescriptor?.(r); } }; }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var ar = { enumerable: !0, configurable: !0, writable: !0 };
function lr(t) { let e = new Set(t); return { getPrototypeOf: () => Object.prototype, getOwnPropertyDescriptor: () => ar, has: (r, n) => e.has(n), set: (r, n, i) => e.add(n) && Reflect.set(r, n, i), ownKeys: () => [...e] }; }
var Bi = Symbol.for("nodejs.util.inspect.custom");
function le(t, e) { let r = Ha(e), n = new Set, i = new Proxy(t, { get(o, s) { if (n.has(s))
        return o[s]; let a = r.get(s); return a ? a.getPropertyValue(s) : o[s]; }, has(o, s) { if (n.has(s))
        return !0; let a = r.get(s); return a ? a.has?.(s) ?? !0 : Reflect.has(o, s); }, ownKeys(o) { let s = $i(Reflect.ownKeys(o), r), a = $i(Array.from(r.keys()), r); return [...new Set([...s, ...a, ...n])]; }, set(o, s, a) { return r.get(s)?.getPropertyDescriptor?.(s)?.writable === !1 ? !1 : (n.add(s), Reflect.set(o, s, a)); }, getOwnPropertyDescriptor(o, s) { let a = Reflect.getOwnPropertyDescriptor(o, s); if (a && !a.configurable)
        return a; let f = r.get(s); return f ? f.getPropertyDescriptor ? { ...ar, ...f?.getPropertyDescriptor(s) } : ar : a; }, defineProperty(o, s, a) { return n.add(s), Reflect.defineProperty(o, s, a); }, getPrototypeOf: () => Object.prototype }); return i[Bi] = function () { let o = { ...this }; return delete o[Bi], o; }, i; }
function Ha(t) { let e = new Map; for (let r of t) {
    let n = r.getKeys();
    for (let i of n)
        e.set(i, r);
} return e; }
function $i(t, e) { return t.filter(r => e.get(r)?.has?.(r) ?? !0); }
u();
c();
m();
p();
d();
l();
function et(t) { return { getKeys() { return t; }, has() { return !1; }, getPropertyValue() { } }; }
u();
c();
m();
p();
d();
l();
function ur(t, e) { return { batch: t, transaction: e?.kind === "batch" ? { isolationLevel: e.options.isolationLevel } : void 0 }; }
u();
c();
m();
p();
d();
l();
function Vi(t) { if (t === void 0)
    return ""; let e = Ye(t); return new Je(0, { colors: Wt }).write(e).toString(); }
u();
c();
m();
p();
d();
l();
var za = "P2037";
function cr({ error: t, user_facing_error: e }, r, n) { return e.error_code ? new Z(Ya(e, n), { code: e.error_code, clientVersion: r, meta: e.meta, batchRequestIdx: e.batch_request_idx }) : new Q(t, { clientVersion: r, batchRequestIdx: e.batch_request_idx }); }
function Ya(t, e) {
    let r = t.message;
    return (e === "postgresql" || e === "postgres" || e === "mysql") && t.error_code === za && (r += `
Prisma Accelerate has built-in connection pooling to prevent such errors: https://pris.ly/client/error-accelerate`), r;
}
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var Xr = class {
    getLocation() { return null; }
};
function Re(t) { return typeof $EnabledCallSite == "function" && t !== "minimal" ? new $EnabledCallSite : new Xr; }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var ji = { _avg: !0, _count: !0, _sum: !0, _min: !0, _max: !0 };
function tt(t = {}) { let e = Za(t); return Object.entries(e).reduce((n, [i, o]) => (ji[i] !== void 0 ? n.select[i] = { select: o } : n[i] = o, n), { select: {} }); }
function Za(t = {}) { return typeof t._count == "boolean" ? { ...t, _count: { _all: t._count } } : t; }
function mr(t = {}) { return e => (typeof t._count == "boolean" && (e._count = e._count._all), e); }
function Qi(t, e) { let r = mr(t); return e({ action: "aggregate", unpacker: r, argsMapper: tt })(t); }
u();
c();
m();
p();
d();
l();
function el(t = {}) { let { select: e, ...r } = t; return typeof e == "object" ? tt({ ...r, _count: e }) : tt({ ...r, _count: { _all: !0 } }); }
function tl(t = {}) { return typeof t.select == "object" ? e => mr(t)(e)._count : e => mr(t)(e)._count._all; }
function Ji(t, e) { return e({ action: "count", unpacker: tl(t), argsMapper: el })(t); }
u();
c();
m();
p();
d();
l();
function rl(t = {}) { let e = tt(t); if (Array.isArray(e.by))
    for (let r of e.by)
        typeof r == "string" && (e.select[r] = !0);
else
    typeof e.by == "string" && (e.select[e.by] = !0); return e; }
function nl(t = {}) { return e => (typeof t?._count == "boolean" && e.forEach(r => { r._count = r._count._all; }), e); }
function Gi(t, e) { return e({ action: "groupBy", unpacker: nl(t), argsMapper: rl })(t); }
function Wi(t, e, r) { if (e === "aggregate")
    return n => Qi(n, r); if (e === "count")
    return n => Ji(n, r); if (e === "groupBy")
    return n => Gi(n, r); }
u();
c();
m();
p();
d();
l();
function Ki(t, e) { let r = e.fields.filter(i => !i.relationName), n = ii(r, "name"); return new Proxy({}, { get(i, o) { if (o in i || typeof o == "symbol")
        return i[o]; let s = n[o]; if (s)
        return new yt(t, o, s.type, s.isList, s.kind === "enum"); }, ...lr(Object.keys(n)) }); }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var Hi = t => Array.isArray(t) ? t : t.split("."), Zr = (t, e) => Hi(e).reduce((r, n) => r && r[n], t), zi = (t, e, r) => Hi(e).reduceRight((n, i, o, s) => Object.assign({}, Zr(t, s.slice(0, o)), { [i]: n }), r);
function il(t, e) { return t === void 0 || e === void 0 ? [] : [...e, "select", t]; }
function ol(t, e, r) { return e === void 0 ? t ?? {} : zi(e, r, t || !0); }
function en(t, e, r, n, i, o) { let a = t._runtimeDataModel.models[e].fields.reduce((f, y) => ({ ...f, [y.name]: y }), {}); return f => { let y = Re(t._errorFormat), C = il(n, i), R = ol(f, o, C), O = r({ dataPath: C, callsite: y })(R), A = sl(t, e); return new Proxy(O, { get(I, k) { if (!A.includes(k))
        return I[k]; let se = [a[k].type, r, k], z = [C, R]; return en(t, ...se, ...z); }, ...lr([...A, ...Object.getOwnPropertyNames(O)]) }); }; }
function sl(t, e) { return t._runtimeDataModel.models[e].fields.filter(r => r.kind === "object").map(r => r.name); }
var al = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "create", "update", "upsert", "delete"], ll = ["aggregate", "count", "groupBy"];
function tn(t, e) { let r = t._extensions.getAllModelExtensions(e) ?? {}, n = [ul(t, e), ml(t, e), Tt(r), H("name", () => e), H("$name", () => e), H("$parent", () => t._appliedParent)]; return le({}, n); }
function ul(t, e) { let r = ge(e), n = Object.keys(pt).concat("count"); return { getKeys() { return n; }, getPropertyValue(i) { let o = i, s = a => f => { let y = Re(t._errorFormat); return t._createPrismaPromise(C => { let R = { args: f, dataPath: [], action: o, model: e, clientMethod: `${r}.${i}`, jsModelName: r, transaction: C, callsite: y }; return t._request({ ...R, ...a }); }, { action: o, args: f, model: e }); }; return al.includes(o) ? en(t, e, s) : cl(i) ? Wi(t, i, s) : s({}); } }; }
function cl(t) { return ll.includes(t); }
function ml(t, e) { return _e(H("fields", () => { let r = t._runtimeDataModel.models[e]; return Ki(e, r); })); }
u();
c();
m();
p();
d();
l();
function Yi(t) { return t.replace(/^./, e => e.toUpperCase()); }
var rn = Symbol();
function Ct(t) { let e = [pl(t), dl(t), H(rn, () => t), H("$parent", () => t._appliedParent)], r = t._extensions.getAllClientExtensions(); return r && e.push(Tt(r)), le(t, e); }
function pl(t) { let e = Object.getPrototypeOf(t._originalClient), r = [...new Set(Object.getOwnPropertyNames(e))]; return { getKeys() { return r; }, getPropertyValue(n) { return t[n]; } }; }
function dl(t) { let e = Object.keys(t._runtimeDataModel.models), r = e.map(ge), n = [...new Set(e.concat(r))]; return _e({ getKeys() { return n; }, getPropertyValue(i) { let o = Yi(i); if (t._runtimeDataModel.models[o] !== void 0)
        return tn(t, o); if (t._runtimeDataModel.models[i] !== void 0)
        return tn(t, i); }, getPropertyDescriptor(i) { if (!r.includes(i))
        return { enumerable: !1 }; } }); }
function Xi(t) { return t[rn] ? t[rn] : t; }
function Zi(t) { if (typeof t == "function")
    return t(this); if (t.client?.__AccelerateEngine) {
    let r = t.client.__AccelerateEngine;
    this._originalClient._engine = new r(this._originalClient._accelerateEngineConfig);
} let e = Object.create(this._originalClient, { _extensions: { value: this._extensions.append(t) }, _appliedParent: { value: this, configurable: !0 }, $use: { value: void 0 }, $on: { value: void 0 } }); return Ct(e); }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
function eo({ result: t, modelName: e, select: r, omit: n, extensions: i }) { let o = i.getAllComputedFields(e); if (!o)
    return t; let s = [], a = []; for (let f of Object.values(o)) {
    if (n) {
        if (n[f.name])
            continue;
        let y = f.needs.filter(C => n[C]);
        y.length > 0 && a.push(et(y));
    }
    else if (r) {
        if (!r[f.name])
            continue;
        let y = f.needs.filter(C => !r[C]);
        y.length > 0 && a.push(et(y));
    }
    fl(t, f.needs) && s.push(gl(f, le(t, s)));
} return s.length > 0 || a.length > 0 ? le(t, [...s, ...a]) : t; }
function fl(t, e) { return e.every(r => Nr(t, r)); }
function gl(t, e) { return _e(H(t.name, () => t.compute(e))); }
u();
c();
m();
p();
d();
l();
function pr({ visitor: t, result: e, args: r, runtimeDataModel: n, modelName: i }) { if (Array.isArray(e)) {
    for (let s = 0; s < e.length; s++)
        e[s] = pr({ result: e[s], args: r, modelName: i, runtimeDataModel: n, visitor: t });
    return e;
} let o = t(e, i, r) ?? e; return r.include && to({ includeOrSelect: r.include, result: o, parentModelName: i, runtimeDataModel: n, visitor: t }), r.select && to({ includeOrSelect: r.select, result: o, parentModelName: i, runtimeDataModel: n, visitor: t }), o; }
function to({ includeOrSelect: t, result: e, parentModelName: r, runtimeDataModel: n, visitor: i }) { for (let [o, s] of Object.entries(t)) {
    if (!s || e[o] == null || ye(s))
        continue;
    let f = n.models[r].fields.find(C => C.name === o);
    if (!f || f.kind !== "object" || !f.relationName)
        continue;
    let y = typeof s == "object" ? s : {};
    e[o] = pr({ visitor: i, result: e[o], args: y, modelName: f.type, runtimeDataModel: n });
} }
function ro({ result: t, modelName: e, args: r, extensions: n, runtimeDataModel: i, globalOmit: o }) { return n.isEmpty() || t == null || typeof t != "object" || !i.models[e] ? t : pr({ result: t, args: r ?? {}, modelName: e, runtimeDataModel: i, visitor: (a, f, y) => { let C = ge(f); return eo({ result: a, modelName: C, select: y.select, omit: y.select ? void 0 : { ...o?.[C], ...y.omit }, extensions: n }); } }); }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
l();
u();
c();
m();
p();
d();
l();
var yl = ["$connect", "$disconnect", "$on", "$transaction", "$use", "$extends"], no = yl;
function io(t) { if (t instanceof ee)
    return hl(t); if (or(t))
    return bl(t); if (Array.isArray(t)) {
    let r = [t[0]];
    for (let n = 1; n < t.length; n++)
        r[n] = Rt(t[n]);
    return r;
} let e = {}; for (let r in t)
    e[r] = Rt(t[r]); return e; }
function hl(t) { return new ee(t.strings, t.values); }
function bl(t) { return new vt(t.sql, t.values); }
function Rt(t) { if (typeof t != "object" || t == null || t instanceof Pe || ze(t))
    return t; if (Qe(t))
    return new pe(t.toFixed()); if (je(t))
    return new Date(+t); if (ArrayBuffer.isView(t))
    return t.slice(0); if (Array.isArray(t)) {
    let e = t.length, r;
    for (r = Array(e); e--;)
        r[e] = Rt(t[e]);
    return r;
} if (typeof t == "object") {
    let e = {};
    for (let r in t)
        r === "__proto__" ? Object.defineProperty(e, r, { value: Rt(t[r]), configurable: !0, enumerable: !0, writable: !0 }) : e[r] = Rt(t[r]);
    return e;
} Ee(t, "Unknown value"); }
function so(t, e, r, n = 0) { return t._createPrismaPromise(i => { let o = e.customDataProxyFetch; return "transaction" in e && i !== void 0 && (e.transaction?.kind === "batch" && e.transaction.lock.then(), e.transaction = i), n === r.length ? t._executeRequest(e) : r[n]({ model: e.model, operation: e.model ? e.action : e.clientMethod, args: io(e.args ?? {}), __internalParams: e, query: (s, a = e) => { let f = a.customDataProxyFetch; return a.customDataProxyFetch = co(o, f), a.args = s, so(t, a, r, n + 1); } }); }); }
function ao(t, e) { let { jsModelName: r, action: n, clientMethod: i } = e, o = r ? n : i; if (t._extensions.isEmpty())
    return t._executeRequest(e); let s = t._extensions.getAllQueryCallbacks(r ?? "$none", o); return so(t, e, s); }
function lo(t) { return e => { let r = { requests: e }, n = e[0].extensions.getAllBatchQueryCallbacks(); return n.length ? uo(r, n, 0, t) : t(r); }; }
function uo(t, e, r, n) { if (r === e.length)
    return n(t); let i = t.customDataProxyFetch, o = t.requests[0].transaction; return e[r]({ args: { queries: t.requests.map(s => ({ model: s.modelName, operation: s.action, args: s.args })), transaction: o ? { isolationLevel: o.kind === "batch" ? o.isolationLevel : void 0 } : void 0 }, __internalParams: t, query(s, a = t) { let f = a.customDataProxyFetch; return a.customDataProxyFetch = co(i, f), uo(a, e, r + 1, n); } }); }
var oo = t => t;
function co(t = oo, e = oo) { return r => t(e(r)); }
u();
c();
m();
p();
d();
l();
var mo = G("prisma:client"), po = { Vercel: "vercel", "Netlify CI": "netlify" };
function fo({ postinstall: t, ciName: e, clientVersion: r }) {
    if (mo("checkPlatformCaching:postinstall", t), mo("checkPlatformCaching:ciName", e), t === !0 && e && e in po) {
        let n = `Prisma has detected that this project was built on ${e}, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered. To fix this, make sure to run the \`prisma generate\` command during the build process.

Learn how: https://pris.ly/d/${po[e]}-build`;
        throw console.error(n), new D(n, r);
    }
}
u();
c();
m();
p();
d();
l();
function go(t, e) { return t ? t.datasources ? t.datasources : t.datasourceUrl ? { [e[0]]: { url: t.datasourceUrl } } : {} : {}; }
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var wl = () => globalThis.process?.release?.name === "node", El = () => !!globalThis.Bun || !!globalThis.process?.versions?.bun, xl = () => !!globalThis.Deno, Pl = () => typeof globalThis.Netlify == "object", vl = () => typeof globalThis.EdgeRuntime == "object", Tl = () => globalThis.navigator?.userAgent === "Cloudflare-Workers";
function Cl() { return [[Pl, "netlify"], [vl, "edge-light"], [Tl, "workerd"], [xl, "deno"], [El, "bun"], [wl, "node"]].flatMap(r => r[0]() ? [r[1]] : []).at(0) ?? ""; }
var Rl = { node: "Node.js", workerd: "Cloudflare Workers", deno: "Deno and Deno Deploy", netlify: "Netlify Edge Functions", "edge-light": "Edge Runtime (Vercel Edge Functions, Vercel Edge Middleware, Next.js (Pages Router) Edge API Routes, Next.js (App Router) Edge Route Handlers or Next.js Middleware)" };
function Ae() { let t = Cl(); return { id: t, prettyName: Rl[t] || t, isEdge: ["workerd", "deno", "netlify", "edge-light"].includes(t) }; }
u();
c();
m();
p();
d();
l();
var yo = "6.13.0";
u();
c();
m();
p();
d();
l();
function dr({ inlineDatasources: t, overrideDatasources: e, env: r, clientVersion: n }) {
    let i, o = Object.keys(t)[0], s = t[o]?.url, a = e[o]?.url;
    if (o === void 0 ? i = void 0 : a ? i = a : s?.value ? i = s.value : s?.fromEnvVar && (i = r[s.fromEnvVar]), s?.fromEnvVar !== void 0 && i === void 0)
        throw Ae().id === "workerd" ? new D(`error: Environment variable not found: ${s.fromEnvVar}.

In Cloudflare module Workers, environment variables are available only in the Worker's \`env\` parameter of \`fetch\`.
To solve this, provide the connection string directly: https://pris.ly/d/cloudflare-datasource-url`, n) : new D(`error: Environment variable not found: ${s.fromEnvVar}.`, n);
    if (i === void 0)
        throw new D("error: Missing URL environment variable, value, or override.", n);
    return i;
}
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
function ho(t) { if (t?.kind === "itx")
    return t.options.id; }
u();
c();
m();
p();
d();
l();
var nn, bo = { async loadLibrary(t) { let { clientVersion: e, adapter: r, engineWasm: n } = t; if (r === void 0)
        throw new D(`The \`adapter\` option for \`PrismaClient\` is required in this context (${Ae().prettyName})`, e); if (n === void 0)
        throw new D("WASM engine was unexpectedly `undefined`", e); nn === void 0 && (nn = (async () => { let o = await n.getRuntime(), s = await n.getQueryEngineWasmModule(); if (s == null)
        throw new D("The loaded wasm module was unexpectedly `undefined` or `null` once loaded", e); let a = { "./query_engine_bg.js": o }, f = new WebAssembly.Instance(s, a), y = f.exports.__wbindgen_start; return o.__wbg_set_wasm(f.exports), y(), o.QueryEngine; })()); let i = await nn; return { debugPanic() { return Promise.reject("{}"); }, dmmf() { return Promise.resolve("{}"); }, version() { return { commit: "unknown", version: "unknown" }; }, QueryEngine: i }; } };
var Sl = "P2036", he = G("prisma:client:libraryEngine");
function kl(t) { return t.item_type === "query" && "query" in t; }
function Ol(t) { return "level" in t ? t.level === "error" && t.message === "PANIC" : !1; }
var BS = [...Mr, "native"], Il = 0xffffffffffffffffn, on = 1n;
function Ml() { let t = on++; return on > Il && (on = 1n), t; }
var At = class {
    constructor(e, r) {
        this.name = "LibraryEngine";
        this.libraryLoader = r ?? bo, this.config = e, this.libraryStarted = !1, this.logQueries = e.logQueries ?? !1, this.logLevel = e.logLevel ?? "error", this.logEmitter = e.logEmitter, this.datamodel = e.inlineSchema, this.tracingHelper = e.tracingHelper, e.enableDebugLogs && (this.logLevel = "debug");
        let n = Object.keys(e.overrideDatasources)[0], i = e.overrideDatasources[n]?.url;
        n !== void 0 && i !== void 0 && (this.datasourceOverrides = { [n]: i }), this.libraryInstantiationPromise = this.instantiateLibrary();
    }
    wrapEngine(e) { return { applyPendingMigrations: e.applyPendingMigrations?.bind(e), commitTransaction: this.withRequestId(e.commitTransaction.bind(e)), connect: this.withRequestId(e.connect.bind(e)), disconnect: this.withRequestId(e.disconnect.bind(e)), metrics: e.metrics?.bind(e), query: this.withRequestId(e.query.bind(e)), rollbackTransaction: this.withRequestId(e.rollbackTransaction.bind(e)), sdlSchema: e.sdlSchema?.bind(e), startTransaction: this.withRequestId(e.startTransaction.bind(e)), trace: e.trace.bind(e), free: e.free?.bind(e) }; }
    withRequestId(e) { return async (...r) => { let n = Ml().toString(); try {
        return await e(...r, n);
    }
    finally {
        if (this.tracingHelper.isEnabled()) {
            let i = await this.engine?.trace(n);
            if (i) {
                let o = JSON.parse(i);
                this.tracingHelper.dispatchEngineSpans(o.spans);
            }
        }
    } }; }
    async applyPendingMigrations() { throw new Error("Cannot call this method from this type of engine instance"); }
    async transaction(e, r, n) { await this.start(); let i = await this.adapterPromise, o = JSON.stringify(r), s; if (e === "start") {
        let f = JSON.stringify({ max_wait: n.maxWait, timeout: n.timeout, isolation_level: n.isolationLevel });
        s = await this.engine?.startTransaction(f, o);
    }
    else
        e === "commit" ? s = await this.engine?.commitTransaction(n.id, o) : e === "rollback" && (s = await this.engine?.rollbackTransaction(n.id, o)); let a = this.parseEngineResponse(s); if (Dl(a)) {
        let f = this.getExternalAdapterError(a, i?.errorRegistry);
        throw f ? f.error : new Z(a.message, { code: a.error_code, clientVersion: this.config.clientVersion, meta: a.meta });
    }
    else if (typeof a.message == "string")
        throw new Q(a.message, { clientVersion: this.config.clientVersion }); return a; }
    async instantiateLibrary() { if (he("internalSetup"), this.libraryInstantiationPromise)
        return this.libraryInstantiationPromise; this.binaryTarget = await this.getCurrentBinaryTarget(), await this.tracingHelper.runInChildSpan("load_engine", () => this.loadEngine()), this.version(); }
    async getCurrentBinaryTarget() { }
    parseEngineResponse(e) { if (!e)
        throw new Q("Response from the Engine was empty", { clientVersion: this.config.clientVersion }); try {
        return JSON.parse(e);
    }
    catch {
        throw new Q("Unable to JSON.parse response from engine", { clientVersion: this.config.clientVersion });
    } }
    async loadEngine() { if (!this.engine) {
        this.QueryEngineConstructor || (this.library = await this.libraryLoader.loadLibrary(this.config), this.QueryEngineConstructor = this.library.QueryEngine);
        try {
            let e = new w(this);
            this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(Bt));
            let r = await this.adapterPromise;
            r && he("Using driver adapter: %O", r), this.engine = this.wrapEngine(new this.QueryEngineConstructor({ datamodel: this.datamodel, env: g.env, logQueries: this.config.logQueries ?? !1, ignoreEnvVarErrors: !0, datasourceOverrides: this.datasourceOverrides ?? {}, logLevel: this.logLevel, configDir: this.config.cwd, engineProtocol: "json", enableTracing: this.tracingHelper.isEnabled() }, n => { e.deref()?.logger(n); }, r));
        }
        catch (e) {
            let r = e, n = this.parseInitError(r.message);
            throw typeof n == "string" ? r : new D(n.message, this.config.clientVersion, n.error_code);
        }
    } }
    logger(e) { let r = this.parseEngineResponse(e); r && (r.level = r?.level.toLowerCase() ?? "unknown", kl(r) ? this.logEmitter.emit("query", { timestamp: new Date, query: r.query, params: r.params, duration: Number(r.duration_ms), target: r.module_path }) : (Ol(r), this.logEmitter.emit(r.level, { timestamp: new Date, message: r.message, target: r.module_path }))); }
    parseInitError(e) { try {
        return JSON.parse(e);
    }
    catch { } return e; }
    parseRequestError(e) { try {
        return JSON.parse(e);
    }
    catch { } return e; }
    onBeforeExit() { throw new Error('"beforeExit" hook is not applicable to the library engine since Prisma 5.0.0, it is only relevant and implemented for the binary engine. Please add your event listener to the `process` object directly instead.'); }
    async start() { if (this.libraryInstantiationPromise || (this.libraryInstantiationPromise = this.instantiateLibrary()), await this.libraryInstantiationPromise, await this.libraryStoppingPromise, this.libraryStartingPromise)
        return he(`library already starting, this.libraryStarted: ${this.libraryStarted}`), this.libraryStartingPromise; if (this.libraryStarted)
        return; let e = async () => { he("library starting"); try {
        let r = { traceparent: this.tracingHelper.getTraceParent() };
        await this.engine?.connect(JSON.stringify(r)), this.libraryStarted = !0, this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(Bt)), await this.adapterPromise, he("library started");
    }
    catch (r) {
        let n = this.parseInitError(r.message);
        throw typeof n == "string" ? r : new D(n.message, this.config.clientVersion, n.error_code);
    }
    finally {
        this.libraryStartingPromise = void 0;
    } }; return this.libraryStartingPromise = this.tracingHelper.runInChildSpan("connect", e), this.libraryStartingPromise; }
    async stop() { if (await this.libraryInstantiationPromise, await this.libraryStartingPromise, await this.executingQueryPromise, this.libraryStoppingPromise)
        return he("library is already stopping"), this.libraryStoppingPromise; if (!this.libraryStarted) {
        await (await this.adapterPromise)?.dispose(), this.adapterPromise = void 0;
        return;
    } let e = async () => { await new Promise(n => setImmediate(n)), he("library stopping"); let r = { traceparent: this.tracingHelper.getTraceParent() }; await this.engine?.disconnect(JSON.stringify(r)), this.engine?.free && this.engine.free(), this.engine = void 0, this.libraryStarted = !1, this.libraryStoppingPromise = void 0, this.libraryInstantiationPromise = void 0, await (await this.adapterPromise)?.dispose(), this.adapterPromise = void 0, he("library stopped"); }; return this.libraryStoppingPromise = this.tracingHelper.runInChildSpan("disconnect", e), this.libraryStoppingPromise; }
    version() { return this.versionInfo = this.library?.version(), this.versionInfo?.version ?? "unknown"; }
    debugPanic(e) { return this.library?.debugPanic(e); }
    async request(e, { traceparent: r, interactiveTransaction: n }) {
        he(`sending request, this.libraryStarted: ${this.libraryStarted}`);
        let i = JSON.stringify({ traceparent: r }), o = JSON.stringify(e);
        try {
            await this.start();
            let s = await this.adapterPromise;
            this.executingQueryPromise = this.engine?.query(o, i, n?.id), this.lastQuery = o;
            let a = this.parseEngineResponse(await this.executingQueryPromise);
            if (a.errors)
                throw a.errors.length === 1 ? this.buildQueryError(a.errors[0], s?.errorRegistry) : new Q(JSON.stringify(a.errors), { clientVersion: this.config.clientVersion });
            if (this.loggerRustPanic)
                throw this.loggerRustPanic;
            return { data: a };
        }
        catch (s) {
            if (s instanceof D)
                throw s;
            s.code === "GenericFailure" && s.message?.startsWith("PANIC:");
            let a = this.parseRequestError(s.message);
            throw typeof a == "string" ? s : new Q(`${a.message}
${a.backtrace}`, { clientVersion: this.config.clientVersion });
        }
    }
    async requestBatch(e, { transaction: r, traceparent: n }) { he("requestBatch"); let i = ur(e, r); await this.start(); let o = await this.adapterPromise; this.lastQuery = JSON.stringify(i), this.executingQueryPromise = this.engine?.query(this.lastQuery, JSON.stringify({ traceparent: n }), ho(r)); let s = await this.executingQueryPromise, a = this.parseEngineResponse(s); if (a.errors)
        throw a.errors.length === 1 ? this.buildQueryError(a.errors[0], o?.errorRegistry) : new Q(JSON.stringify(a.errors), { clientVersion: this.config.clientVersion }); let { batchResult: f, errors: y } = a; if (Array.isArray(f))
        return f.map(C => C.errors && C.errors.length > 0 ? this.loggerRustPanic ?? this.buildQueryError(C.errors[0], o?.errorRegistry) : { data: C }); throw y && y.length === 1 ? new Error(y[0].error) : new Error(JSON.stringify(a)); }
    buildQueryError(e, r) { e.user_facing_error.is_panic; let n = this.getExternalAdapterError(e.user_facing_error, r); return n ? n.error : cr(e, this.config.clientVersion, this.config.activeProvider); }
    getExternalAdapterError(e, r) { if (e.error_code === Sl && r) {
        let n = e.meta?.id;
        $t(typeof n == "number", "Malformed external JS error received from the engine");
        let i = r.consumeError(n);
        return $t(i, "External error with reported id was not registered"), i;
    } }
    async metrics(e) { await this.start(); let r = await this.engine.metrics(JSON.stringify(e)); return e.format === "prometheus" ? r : this.parseEngineResponse(r); }
};
function Dl(t) { return typeof t == "object" && t !== null && t.error_code !== void 0; }
u();
c();
m();
p();
d();
l();
var St = "Accelerate has not been setup correctly. Make sure your client is using `.$extends(withAccelerate())`. See https://pris.ly/d/accelerate-getting-started", fr = class {
    constructor(e) {
        this.name = "AccelerateEngine";
        this.config = e;
        this.resolveDatasourceUrl = this.config.accelerateUtils?.resolveDatasourceUrl, this.getBatchRequestPayload = this.config.accelerateUtils?.getBatchRequestPayload, this.prismaGraphQLToJSError = this.config.accelerateUtils?.prismaGraphQLToJSError, this.PrismaClientUnknownRequestError = this.config.accelerateUtils?.PrismaClientUnknownRequestError, this.PrismaClientInitializationError = this.config.accelerateUtils?.PrismaClientInitializationError, this.PrismaClientKnownRequestError = this.config.accelerateUtils?.PrismaClientKnownRequestError, this.debug = this.config.accelerateUtils?.debug, this.engineVersion = this.config.accelerateUtils?.engineVersion, this.clientVersion = this.config.accelerateUtils?.clientVersion;
    }
    onBeforeExit(e) { }
    async start() { }
    async stop() { }
    version(e) { return "unknown"; }
    transaction(e, r, n) { throw new D(St, this.config.clientVersion); }
    metrics(e) { throw new D(St, this.config.clientVersion); }
    request(e, r) { throw new D(St, this.config.clientVersion); }
    requestBatch(e, r) { throw new D(St, this.config.clientVersion); }
    applyPendingMigrations() { throw new D(St, this.config.clientVersion); }
};
u();
c();
m();
p();
d();
l();
function wo({ url: t, adapter: e, copyEngine: r, targetBuildType: n }) {
    let i = [], o = [], s = k => { i.push({ _tag: "warning", value: k }); }, a = k => {
        let M = k.join(`
`);
        o.push({ _tag: "error", value: M });
    }, f = !!t?.startsWith("prisma://"), y = Fr(t), C = !!e, R = f || y;
    !C && r && R && s(["recommend--no-engine", "In production, we recommend using `prisma generate --no-engine` (See: `prisma generate --help`)"]);
    let O = R || !r;
    C && (O || n === "edge") && (n === "edge" ? a(["Prisma Client was configured to use the `adapter` option but it was imported via its `/edge` endpoint.", "Please either remove the `/edge` endpoint or remove the `adapter` from the Prisma Client constructor."]) : r ? f && a(["Prisma Client was configured to use the `adapter` option but the URL was a `prisma://` URL.", "Please either use the `prisma://` URL or remove the `adapter` from the Prisma Client constructor."]) : a(["Prisma Client was configured to use the `adapter` option but `prisma generate` was run with `--no-engine`.", "Please run `prisma generate` without `--no-engine` to be able to use Prisma Client with the adapter."]));
    let A = { accelerate: O, ppg: y, driverAdapters: C };
    function I(k) { return k.length > 0; }
    return I(o) ? { ok: !1, diagnostics: { warnings: i, errors: o }, isUsing: A } : { ok: !0, diagnostics: { warnings: i }, isUsing: A };
}
function Eo({ copyEngine: t = !0 }, e) {
    let r;
    try {
        r = dr({ inlineDatasources: e.inlineDatasources, overrideDatasources: e.overrideDatasources, env: { ...e.env, ...g.env }, clientVersion: e.clientVersion });
    }
    catch { }
    let { ok: n, isUsing: i, diagnostics: o } = wo({ url: r, adapter: e.adapter, copyEngine: t, targetBuildType: "wasm-engine-edge" });
    for (let R of o.warnings)
        ct(...R.value);
    if (!n) {
        let R = o.errors[0];
        throw new K(R.value, { clientVersion: e.clientVersion });
    }
    let s = Be(e.generator), a = s === "library", f = s === "binary", y = s === "client", C = (i.accelerate || i.ppg) && !i.driverAdapters;
    if (i.accelerate, i.driverAdapters)
        return new At(e);
    if (i.accelerate)
        return new fr(e);
    {
        let R = [`PrismaClient failed to initialize because it wasn't configured to run in this environment (${Ae().prettyName}).`, "In order to run Prisma Client in an edge runtime, you will need to configure one of the following options:", "- Enable Driver Adapters: https://pris.ly/d/driver-adapters", "- Enable Accelerate: https://pris.ly/d/accelerate"];
        throw new K(R.join(`
`), { clientVersion: e.clientVersion });
    }
    return "wasm-engine-edge";
}
u();
c();
m();
p();
d();
l();
function gr({ generator: t }) { return t?.previewFeatures ?? []; }
u();
c();
m();
p();
d();
l();
var xo = t => ({ command: t });
u();
c();
m();
p();
d();
l();
u();
c();
m();
p();
d();
l();
var Po = t => t.strings.reduce((e, r, n) => `${e}@P${n}${r}`);
u();
c();
m();
p();
d();
l();
l();
function rt(t) { try {
    return vo(t, "fast");
}
catch {
    return vo(t, "slow");
} }
function vo(t, e) { return JSON.stringify(t.map(r => Co(r, e))); }
function Co(t, e) { if (Array.isArray(t))
    return t.map(r => Co(r, e)); if (typeof t == "bigint")
    return { prisma__type: "bigint", prisma__value: t.toString() }; if (je(t))
    return { prisma__type: "date", prisma__value: t.toJSON() }; if (pe.isDecimal(t))
    return { prisma__type: "decimal", prisma__value: t.toJSON() }; if (b.isBuffer(t))
    return { prisma__type: "bytes", prisma__value: t.toString("base64") }; if (_l(t))
    return { prisma__type: "bytes", prisma__value: b.from(t).toString("base64") }; if (ArrayBuffer.isView(t)) {
    let { buffer: r, byteOffset: n, byteLength: i } = t;
    return { prisma__type: "bytes", prisma__value: b.from(r, n, i).toString("base64") };
} return typeof t == "object" && e === "slow" ? Ro(t) : t; }
function _l(t) { return t instanceof ArrayBuffer || t instanceof SharedArrayBuffer ? !0 : typeof t == "object" && t !== null ? t[Symbol.toStringTag] === "ArrayBuffer" || t[Symbol.toStringTag] === "SharedArrayBuffer" : !1; }
function Ro(t) { if (typeof t != "object" || t === null)
    return t; if (typeof t.toJSON == "function")
    return t.toJSON(); if (Array.isArray(t))
    return t.map(To); let e = {}; for (let r of Object.keys(t))
    e[r] = To(t[r]); return e; }
function To(t) { return typeof t == "bigint" ? t.toString() : Ro(t); }
var Ll = /^(\s*alter\s)/i, Ao = G("prisma:client");
function sn(t, e, r, n) {
    if (!(t !== "postgresql" && t !== "cockroachdb") && r.length > 0 && Ll.exec(e))
        throw new Error(`Running ALTER using ${n} is not supported
Using the example below you can still execute your query with Prisma, but please note that it is vulnerable to SQL injection attacks and requires you to take care of input sanitization.

Example:
  await prisma.$executeRawUnsafe(\`ALTER USER prisma WITH PASSWORD '\${password}'\`)

More Information: https://pris.ly/d/execute-raw
`);
}
var an = ({ clientMethod: t, activeProvider: e }) => r => { let n = "", i; if (or(r))
    n = r.sql, i = { values: rt(r.values), __prismaRawParameters__: !0 };
else if (Array.isArray(r)) {
    let [o, ...s] = r;
    n = o, i = { values: rt(s || []), __prismaRawParameters__: !0 };
}
else
    switch (e) {
        case "sqlite":
        case "mysql": {
            n = r.sql, i = { values: rt(r.values), __prismaRawParameters__: !0 };
            break;
        }
        case "cockroachdb":
        case "postgresql":
        case "postgres": {
            n = r.text, i = { values: rt(r.values), __prismaRawParameters__: !0 };
            break;
        }
        case "sqlserver": {
            n = Po(r), i = { values: rt(r.values), __prismaRawParameters__: !0 };
            break;
        }
        default: throw new Error(`The ${e} provider does not support ${t}`);
    } return i?.values ? Ao(`prisma.${t}(${n}, ${i.values})`) : Ao(`prisma.${t}(${n})`), { query: n, parameters: i }; }, So = { requestArgsToMiddlewareArgs(t) { return [t.strings, ...t.values]; }, middlewareArgsToRequestArgs(t) { let [e, ...r] = t; return new ee(e, r); } }, ko = { requestArgsToMiddlewareArgs(t) { return [t]; }, middlewareArgsToRequestArgs(t) { return t[0]; } };
u();
c();
m();
p();
d();
l();
function ln(t) { return function (r, n) { let i, o = (s = t) => { try {
    return s === void 0 || s?.kind === "itx" ? i ?? (i = Oo(r(s))) : Oo(r(s));
}
catch (a) {
    return Promise.reject(a);
} }; return { get spec() { return n; }, then(s, a) { return o().then(s, a); }, catch(s) { return o().catch(s); }, finally(s) { return o().finally(s); }, requestTransaction(s) { let a = o(s); return a.requestTransaction ? a.requestTransaction(s) : a; }, [Symbol.toStringTag]: "PrismaPromise" }; }; }
function Oo(t) { return typeof t.then == "function" ? t : Promise.resolve(t); }
u();
c();
m();
p();
d();
l();
var Fl = Dr.split(".")[0], Ul = { isEnabled() { return !1; }, getTraceParent() { return "00-10-10-00"; }, dispatchEngineSpans() { }, getActiveContext() { }, runInChildSpan(t, e) { return e(); } }, un = class {
    isEnabled() { return this.getGlobalTracingHelper().isEnabled(); }
    getTraceParent(e) { return this.getGlobalTracingHelper().getTraceParent(e); }
    dispatchEngineSpans(e) { return this.getGlobalTracingHelper().dispatchEngineSpans(e); }
    getActiveContext() { return this.getGlobalTracingHelper().getActiveContext(); }
    runInChildSpan(e, r) { return this.getGlobalTracingHelper().runInChildSpan(e, r); }
    getGlobalTracingHelper() { let e = globalThis[`V${Fl}_PRISMA_INSTRUMENTATION`], r = globalThis.PRISMA_INSTRUMENTATION; return e?.helper ?? r?.helper ?? Ul; }
};
function Io() { return new un; }
u();
c();
m();
p();
d();
l();
function Mo(t, e = () => { }) { let r, n = new Promise(i => r = i); return { then(i) { return --t === 0 && r(e()), i?.(n); } }; }
u();
c();
m();
p();
d();
l();
function Do(t) { return typeof t == "string" ? t : t.reduce((e, r) => { let n = typeof r == "string" ? r : r.level; return n === "query" ? e : e && (r === "info" || e === "info") ? "info" : n; }, void 0); }
u();
c();
m();
p();
d();
l();
var yr = class {
    constructor() {
        this._middlewares = [];
    }
    use(e) { this._middlewares.push(e); }
    get(e) { return this._middlewares[e]; }
    has(e) { return !!this._middlewares[e]; }
    length() { return this._middlewares.length; }
};
u();
c();
m();
p();
d();
l();
var Lo = ot(ti());
u();
c();
m();
p();
d();
l();
function hr(t) { return typeof t.batchRequestIdx == "number"; }
u();
c();
m();
p();
d();
l();
function _o(t) { if (t.action !== "findUnique" && t.action !== "findUniqueOrThrow")
    return; let e = []; return t.modelName && e.push(t.modelName), t.query.arguments && e.push(cn(t.query.arguments)), e.push(cn(t.query.selection)), e.join(""); }
function cn(t) { return `(${Object.keys(t).sort().map(r => { let n = t[r]; return typeof n == "object" && n !== null ? `(${r} ${cn(n)})` : r; }).join(" ")})`; }
u();
c();
m();
p();
d();
l();
var Nl = { aggregate: !1, aggregateRaw: !1, createMany: !0, createManyAndReturn: !0, createOne: !0, deleteMany: !0, deleteOne: !0, executeRaw: !0, findFirst: !1, findFirstOrThrow: !1, findMany: !1, findRaw: !1, findUnique: !1, findUniqueOrThrow: !1, groupBy: !1, queryRaw: !1, runCommandRaw: !0, updateMany: !0, updateManyAndReturn: !0, updateOne: !0, upsertOne: !0 };
function mn(t) { return Nl[t]; }
u();
c();
m();
p();
d();
l();
var br = class {
    constructor(e) {
        this.tickActive = !1;
        this.options = e;
        this.batches = {};
    }
    request(e) { let r = this.options.batchBy(e); return r ? (this.batches[r] || (this.batches[r] = [], this.tickActive || (this.tickActive = !0, g.nextTick(() => { this.dispatchBatches(), this.tickActive = !1; }))), new Promise((n, i) => { this.batches[r].push({ request: e, resolve: n, reject: i }); })) : this.options.singleLoader(e); }
    dispatchBatches() { for (let e in this.batches) {
        let r = this.batches[e];
        delete this.batches[e], r.length === 1 ? this.options.singleLoader(r[0].request).then(n => { n instanceof Error ? r[0].reject(n) : r[0].resolve(n); }).catch(n => { r[0].reject(n); }) : (r.sort((n, i) => this.options.batchOrder(n.request, i.request)), this.options.batchLoader(r.map(n => n.request)).then(n => { if (n instanceof Error)
            for (let i = 0; i < r.length; i++)
                r[i].reject(n);
        else
            for (let i = 0; i < r.length; i++) {
                let o = n[i];
                o instanceof Error ? r[i].reject(o) : r[i].resolve(o);
            } }).catch(n => { for (let i = 0; i < r.length; i++)
            r[i].reject(n); }));
    } }
    get [Symbol.toStringTag]() { return "DataLoader"; }
};
u();
c();
m();
p();
d();
l();
l();
function Le(t, e) { if (e === null)
    return e; switch (t) {
    case "bigint": return BigInt(e);
    case "bytes": {
        let { buffer: r, byteOffset: n, byteLength: i } = b.from(e, "base64");
        return new Uint8Array(r, n, i);
    }
    case "decimal": return new pe(e);
    case "datetime":
    case "date": return new Date(e);
    case "time": return new Date(`1970-01-01T${e}Z`);
    case "bigint-array": return e.map(r => Le("bigint", r));
    case "bytes-array": return e.map(r => Le("bytes", r));
    case "decimal-array": return e.map(r => Le("decimal", r));
    case "datetime-array": return e.map(r => Le("datetime", r));
    case "date-array": return e.map(r => Le("date", r));
    case "time-array": return e.map(r => Le("time", r));
    default: return e;
} }
function wr(t) { let e = [], r = ql(t); for (let n = 0; n < t.rows.length; n++) {
    let i = t.rows[n], o = { ...r };
    for (let s = 0; s < i.length; s++)
        o[t.columns[s]] = Le(t.types[s], i[s]);
    e.push(o);
} return e; }
function ql(t) { let e = {}; for (let r = 0; r < t.columns.length; r++)
    e[t.columns[r]] = null; return e; }
var Bl = G("prisma:client:request_handler"), Er = class {
    constructor(e, r) { this.logEmitter = r, this.client = e, this.dataloader = new br({ batchLoader: lo(async ({ requests: n, customDataProxyFetch: i }) => { let { transaction: o, otelParentCtx: s } = n[0], a = n.map(R => R.protocolQuery), f = this.client._tracingHelper.getTraceParent(s), y = n.some(R => mn(R.protocolQuery.action)); return (await this.client._engine.requestBatch(a, { traceparent: f, transaction: $l(o), containsWrite: y, customDataProxyFetch: i })).map((R, O) => { if (R instanceof Error)
            return R; try {
            return this.mapQueryEngineResult(n[O], R);
        }
        catch (A) {
            return A;
        } }); }), singleLoader: async (n) => { let i = n.transaction?.kind === "itx" ? Fo(n.transaction) : void 0, o = await this.client._engine.request(n.protocolQuery, { traceparent: this.client._tracingHelper.getTraceParent(), interactiveTransaction: i, isWrite: mn(n.protocolQuery.action), customDataProxyFetch: n.customDataProxyFetch }); return this.mapQueryEngineResult(n, o); }, batchBy: n => n.transaction?.id ? `transaction-${n.transaction.id}` : _o(n.protocolQuery), batchOrder(n, i) { return n.transaction?.kind === "batch" && i.transaction?.kind === "batch" ? n.transaction.index - i.transaction.index : 0; } }); }
    async request(e) { try {
        return await this.dataloader.request(e);
    }
    catch (r) {
        let { clientMethod: n, callsite: i, transaction: o, args: s, modelName: a } = e;
        this.handleAndLogRequestError({ error: r, clientMethod: n, callsite: i, transaction: o, args: s, modelName: a, globalOmit: e.globalOmit });
    } }
    mapQueryEngineResult({ dataPath: e, unpacker: r }, n) { let i = n?.data, o = this.unpack(i, e, r); return g.env.PRISMA_CLIENT_GET_TIME ? { data: o } : o; }
    handleAndLogRequestError(e) { try {
        this.handleRequestError(e);
    }
    catch (r) {
        throw this.logEmitter && this.logEmitter.emit("error", { message: r.message, target: e.clientMethod, timestamp: new Date }), r;
    } }
    handleRequestError({ error: e, clientMethod: r, callsite: n, transaction: i, args: o, modelName: s, globalOmit: a }) { if (Bl(e), Vl(e, i))
        throw e; if (e instanceof Z && jl(e)) {
        let y = Uo(e.meta);
        Zt({ args: o, errors: [y], callsite: n, errorFormat: this.client._errorFormat, originalMethod: r, clientVersion: this.client._clientVersion, globalOmit: a });
    } let f = e.message; if (n && (f = jt({ callsite: n, originalMethod: r, isPanic: e.isPanic, showColors: this.client._errorFormat === "pretty", message: f })), f = this.sanitizeMessage(f), e.code) {
        let y = s ? { modelName: s, ...e.meta } : e.meta;
        throw new Z(f, { code: e.code, clientVersion: this.client._clientVersion, meta: y, batchRequestIdx: e.batchRequestIdx });
    }
    else {
        if (e.isPanic)
            throw new xe(f, this.client._clientVersion);
        if (e instanceof Q)
            throw new Q(f, { clientVersion: this.client._clientVersion, batchRequestIdx: e.batchRequestIdx });
        if (e instanceof D)
            throw new D(f, this.client._clientVersion);
        if (e instanceof xe)
            throw new xe(f, this.client._clientVersion);
    } throw e.clientVersion = this.client._clientVersion, e; }
    sanitizeMessage(e) { return this.client._errorFormat && this.client._errorFormat !== "pretty" ? (0, Lo.default)(e) : e; }
    unpack(e, r, n) { if (!e || (e.data && (e = e.data), !e))
        return e; let i = Object.keys(e)[0], o = Object.values(e)[0], s = r.filter(y => y !== "select" && y !== "include"), a = Zr(o, s), f = i === "queryRaw" ? wr(a) : Ve(a); return n ? n(f) : f; }
    get [Symbol.toStringTag]() { return "RequestHandler"; }
};
function $l(t) { if (t) {
    if (t.kind === "batch")
        return { kind: "batch", options: { isolationLevel: t.isolationLevel } };
    if (t.kind === "itx")
        return { kind: "itx", options: Fo(t) };
    Ee(t, "Unknown transaction kind");
} }
function Fo(t) { return { id: t.id, payload: t.payload }; }
function Vl(t, e) { return hr(t) && e?.kind === "batch" && t.batchRequestIdx !== e.index; }
function jl(t) { return t.code === "P2009" || t.code === "P2012"; }
function Uo(t) { if (t.kind === "Union")
    return { kind: "Union", errors: t.errors.map(Uo) }; if (Array.isArray(t.selectionPath)) {
    let [, ...e] = t.selectionPath;
    return { ...t, selectionPath: e };
} return t; }
u();
c();
m();
p();
d();
l();
var No = yo;
u();
c();
m();
p();
d();
l();
var jo = ot($r());
u();
c();
m();
p();
d();
l();
var _ = class extends Error {
    constructor(e) {
        super(e + `
Read more at https://pris.ly/d/client-constructor`), this.name = "PrismaClientConstructorValidationError";
    }
    get [Symbol.toStringTag]() { return "PrismaClientConstructorValidationError"; }
};
re(_, "PrismaClientConstructorValidationError");
var qo = ["datasources", "datasourceUrl", "errorFormat", "adapter", "log", "transactionOptions", "omit", "__internal"], Bo = ["pretty", "colorless", "minimal"], $o = ["info", "query", "warn", "error"], Ql = { datasources: (t, { datasourceNames: e }) => {
        if (t) {
            if (typeof t != "object" || Array.isArray(t))
                throw new _(`Invalid value ${JSON.stringify(t)} for "datasources" provided to PrismaClient constructor`);
            for (let [r, n] of Object.entries(t)) {
                if (!e.includes(r)) {
                    let i = nt(r, e) || ` Available datasources: ${e.join(", ")}`;
                    throw new _(`Unknown datasource ${r} provided to PrismaClient constructor.${i}`);
                }
                if (typeof n != "object" || Array.isArray(n))
                    throw new _(`Invalid value ${JSON.stringify(t)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
                if (n && typeof n == "object")
                    for (let [i, o] of Object.entries(n)) {
                        if (i !== "url")
                            throw new _(`Invalid value ${JSON.stringify(t)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
                        if (typeof o != "string")
                            throw new _(`Invalid value ${JSON.stringify(o)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
                    }
            }
        }
    }, adapter: (t, e) => { if (!t && Be(e.generator) === "client")
        throw new _('Using engine type "client" requires a driver adapter to be provided to PrismaClient constructor.'); if (t === null)
        return; if (t === void 0)
        throw new _('"adapter" property must not be undefined, use null to conditionally disable driver adapters.'); if (!gr(e).includes("driverAdapters"))
        throw new _('"adapter" property can only be provided to PrismaClient constructor when "driverAdapters" preview feature is enabled.'); if (Be(e.generator) === "binary")
        throw new _('Cannot use a driver adapter with the "binary" Query Engine. Please use the "library" Query Engine.'); }, datasourceUrl: t => {
        if (typeof t < "u" && typeof t != "string")
            throw new _(`Invalid value ${JSON.stringify(t)} for "datasourceUrl" provided to PrismaClient constructor.
Expected string or undefined.`);
    }, errorFormat: t => { if (t) {
        if (typeof t != "string")
            throw new _(`Invalid value ${JSON.stringify(t)} for "errorFormat" provided to PrismaClient constructor.`);
        if (!Bo.includes(t)) {
            let e = nt(t, Bo);
            throw new _(`Invalid errorFormat ${t} provided to PrismaClient constructor.${e}`);
        }
    } }, log: t => { if (!t)
        return; if (!Array.isArray(t))
        throw new _(`Invalid value ${JSON.stringify(t)} for "log" provided to PrismaClient constructor.`); function e(r) { if (typeof r == "string" && !$o.includes(r)) {
        let n = nt(r, $o);
        throw new _(`Invalid log level "${r}" provided to PrismaClient constructor.${n}`);
    } } for (let r of t) {
        e(r);
        let n = { level: e, emit: i => { let o = ["stdout", "event"]; if (!o.includes(i)) {
                let s = nt(i, o);
                throw new _(`Invalid value ${JSON.stringify(i)} for "emit" in logLevel provided to PrismaClient constructor.${s}`);
            } } };
        if (r && typeof r == "object")
            for (let [i, o] of Object.entries(r))
                if (n[i])
                    n[i](o);
                else
                    throw new _(`Invalid property ${i} for "log" provided to PrismaClient constructor`);
    } }, transactionOptions: t => { if (!t)
        return; let e = t.maxWait; if (e != null && e <= 0)
        throw new _(`Invalid value ${e} for maxWait in "transactionOptions" provided to PrismaClient constructor. maxWait needs to be greater than 0`); let r = t.timeout; if (r != null && r <= 0)
        throw new _(`Invalid value ${r} for timeout in "transactionOptions" provided to PrismaClient constructor. timeout needs to be greater than 0`); }, omit: (t, e) => { if (typeof t != "object")
        throw new _('"omit" option is expected to be an object.'); if (t === null)
        throw new _('"omit" option can not be `null`'); let r = []; for (let [n, i] of Object.entries(t)) {
        let o = Gl(n, e.runtimeDataModel);
        if (!o) {
            r.push({ kind: "UnknownModel", modelKey: n });
            continue;
        }
        for (let [s, a] of Object.entries(i)) {
            let f = o.fields.find(y => y.name === s);
            if (!f) {
                r.push({ kind: "UnknownField", modelKey: n, fieldName: s });
                continue;
            }
            if (f.relationName) {
                r.push({ kind: "RelationInOmit", modelKey: n, fieldName: s });
                continue;
            }
            typeof a != "boolean" && r.push({ kind: "InvalidFieldValue", modelKey: n, fieldName: s });
        }
    } if (r.length > 0)
        throw new _(Wl(t, r)); }, __internal: t => { if (!t)
        return; let e = ["debug", "engine", "configOverride"]; if (typeof t != "object")
        throw new _(`Invalid value ${JSON.stringify(t)} for "__internal" to PrismaClient constructor`); for (let [r] of Object.entries(t))
        if (!e.includes(r)) {
            let n = nt(r, e);
            throw new _(`Invalid property ${JSON.stringify(r)} for "__internal" provided to PrismaClient constructor.${n}`);
        } } };
function Qo(t, e) { for (let [r, n] of Object.entries(t)) {
    if (!qo.includes(r)) {
        let i = nt(r, qo);
        throw new _(`Unknown property ${r} provided to PrismaClient constructor.${i}`);
    }
    Ql[r](n, e);
} if (t.datasourceUrl && t.datasources)
    throw new _('Can not use "datasourceUrl" and "datasources" options at the same time. Pick one of them'); }
function nt(t, e) { if (e.length === 0 || typeof t != "string")
    return ""; let r = Jl(t, e); return r ? ` Did you mean "${r}"?` : ""; }
function Jl(t, e) { if (e.length === 0)
    return null; let r = e.map(i => ({ value: i, distance: (0, jo.default)(t, i) })); r.sort((i, o) => i.distance < o.distance ? -1 : 1); let n = r[0]; return n.distance < 3 ? n.value : null; }
function Gl(t, e) { return Vo(e.models, t) ?? Vo(e.types, t); }
function Vo(t, e) { let r = Object.keys(t).find(n => Te(n) === e); if (r)
    return t[r]; }
function Wl(t, e) {
    let r = Ye(t);
    for (let o of e)
        switch (o.kind) {
            case "UnknownModel":
                r.arguments.getField(o.modelKey)?.markAsError(), r.addErrorMessage(() => `Unknown model name: ${o.modelKey}.`);
                break;
            case "UnknownField":
                r.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(), r.addErrorMessage(() => `Model "${o.modelKey}" does not have a field named "${o.fieldName}".`);
                break;
            case "RelationInOmit":
                r.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(), r.addErrorMessage(() => 'Relations are already excluded by default and can not be specified in "omit".');
                break;
            case "InvalidFieldValue":
                r.arguments.getDeepFieldValue([o.modelKey, o.fieldName])?.markAsError(), r.addErrorMessage(() => "Omit field option value must be a boolean.");
                break;
        }
    let { message: n, args: i } = Xt(r, "colorless");
    return `Error validating "omit" option:

${i}

${n}`;
}
u();
c();
m();
p();
d();
l();
function Jo(t) { return t.length === 0 ? Promise.resolve([]) : new Promise((e, r) => { let n = new Array(t.length), i = null, o = !1, s = 0, a = () => { o || (s++, s === t.length && (o = !0, i ? r(i) : e(n))); }, f = y => { o || (o = !0, r(y)); }; for (let y = 0; y < t.length; y++)
    t[y].then(C => { n[y] = C, a(); }, C => { if (!hr(C)) {
        f(C);
        return;
    } C.batchRequestIdx === y ? f(C) : (i || (i = C), a()); }); }); }
var Se = G("prisma:client");
typeof globalThis == "object" && (globalThis.NODE_CLIENT = !0);
var Kl = { requestArgsToMiddlewareArgs: t => t, middlewareArgsToRequestArgs: t => t }, Hl = Symbol.for("prisma.client.transaction.id"), zl = { id: 0, nextId() { return ++this.id; } };
function Ko(t) {
    class e {
        constructor(n) {
            this._originalClient = this;
            this._middlewares = new yr;
            this._createPrismaPromise = ln();
            this.$metrics = new Ze(this);
            this.$extends = Zi;
            t = n?.__internal?.configOverride?.(t) ?? t, fo(t), n && Qo(n, t);
            let i = new sr().on("error", () => { });
            this._extensions = Xe.empty(), this._previewFeatures = gr(t), this._clientVersion = t.clientVersion ?? No, this._activeProvider = t.activeProvider, this._globalOmit = n?.omit, this._tracingHelper = Io();
            let o = t.relativeEnvPaths && { rootEnvPath: t.relativeEnvPaths.rootEnvPath && Nt.resolve(t.dirname, t.relativeEnvPaths.rootEnvPath), schemaEnvPath: t.relativeEnvPaths.schemaEnvPath && Nt.resolve(t.dirname, t.relativeEnvPaths.schemaEnvPath) }, s;
            if (n?.adapter) {
                s = n.adapter;
                let f = t.activeProvider === "postgresql" || t.activeProvider === "cockroachdb" ? "postgres" : t.activeProvider;
                if (s.provider !== f)
                    throw new D(`The Driver Adapter \`${s.adapterName}\`, based on \`${s.provider}\`, is not compatible with the provider \`${f}\` specified in the Prisma schema.`, this._clientVersion);
                if (n.datasources || n.datasourceUrl !== void 0)
                    throw new D("Custom datasource configuration is not compatible with Prisma Driver Adapters. Please define the database connection string directly in the Driver Adapter configuration.", this._clientVersion);
            }
            let a = t.injectableEdgeEnv?.();
            try {
                let f = n ?? {}, y = f.__internal ?? {}, C = y.debug === !0;
                C && G.enable("prisma:client");
                let R = Nt.resolve(t.dirname, t.relativePath);
                qn.existsSync(R) || (R = t.dirname), Se("dirname", t.dirname), Se("relativePath", t.relativePath), Se("cwd", R);
                let O = y.engine || {};
                if (f.errorFormat ? this._errorFormat = f.errorFormat : g.env.NODE_ENV === "production" ? this._errorFormat = "minimal" : g.env.NO_COLOR ? this._errorFormat = "colorless" : this._errorFormat = "colorless", this._runtimeDataModel = t.runtimeDataModel, this._engineConfig = { cwd: R, dirname: t.dirname, enableDebugLogs: C, allowTriggerPanic: O.allowTriggerPanic, prismaPath: O.binaryPath ?? void 0, engineEndpoint: O.endpoint, generator: t.generator, showColors: this._errorFormat === "pretty", logLevel: f.log && Do(f.log), logQueries: f.log && !!(typeof f.log == "string" ? f.log === "query" : f.log.find(A => typeof A == "string" ? A === "query" : A.level === "query")), env: a?.parsed ?? {}, flags: [], engineWasm: t.engineWasm, compilerWasm: t.compilerWasm, clientVersion: t.clientVersion, engineVersion: t.engineVersion, previewFeatures: this._previewFeatures, activeProvider: t.activeProvider, inlineSchema: t.inlineSchema, overrideDatasources: go(f, t.datasourceNames), inlineDatasources: t.inlineDatasources, inlineSchemaHash: t.inlineSchemaHash, tracingHelper: this._tracingHelper, transactionOptions: { maxWait: f.transactionOptions?.maxWait ?? 2e3, timeout: f.transactionOptions?.timeout ?? 5e3, isolationLevel: f.transactionOptions?.isolationLevel }, logEmitter: i, isBundled: t.isBundled, adapter: s }, this._accelerateEngineConfig = { ...this._engineConfig, accelerateUtils: { resolveDatasourceUrl: dr, getBatchRequestPayload: ur, prismaGraphQLToJSError: cr, PrismaClientUnknownRequestError: Q, PrismaClientInitializationError: D, PrismaClientKnownRequestError: Z, debug: G("prisma:client:accelerateEngine"), engineVersion: Wo.version, clientVersion: t.clientVersion } }, Se("clientVersion", t.clientVersion), this._engine = Eo(t, this._engineConfig), this._requestHandler = new Er(this, i), f.log)
                    for (let A of f.log) {
                        let I = typeof A == "string" ? A : A.emit === "stdout" ? A.level : null;
                        I && this.$on(I, k => { ut.log(`${ut.tags[I] ?? ""}`, k.message || k.query); });
                    }
            }
            catch (f) {
                throw f.clientVersion = this._clientVersion, f;
            }
            return this._appliedParent = Ct(this);
        }
        get [Symbol.toStringTag]() { return "PrismaClient"; }
        $use(n) { this._middlewares.use(n); }
        $on(n, i) { return n === "beforeExit" ? this._engine.onBeforeExit(i) : n && this._engineConfig.logEmitter.on(n, i), this; }
        $connect() { try {
            return this._engine.start();
        }
        catch (n) {
            throw n.clientVersion = this._clientVersion, n;
        } }
        async $disconnect() { try {
            await this._engine.stop();
        }
        catch (n) {
            throw n.clientVersion = this._clientVersion, n;
        }
        finally {
            Nn();
        } }
        $executeRawInternal(n, i, o, s) { let a = this._activeProvider; return this._request({ action: "executeRaw", args: o, transaction: n, clientMethod: i, argsMapper: an({ clientMethod: i, activeProvider: a }), callsite: Re(this._errorFormat), dataPath: [], middlewareArgsMapper: s }); }
        $executeRaw(n, ...i) { return this._createPrismaPromise(o => { if (n.raw !== void 0 || n.sql !== void 0) {
            let [s, a] = Go(n, i);
            return sn(this._activeProvider, s.text, s.values, Array.isArray(n) ? "prisma.$executeRaw`<SQL>`" : "prisma.$executeRaw(sql`<SQL>`)"), this.$executeRawInternal(o, "$executeRaw", s, a);
        } throw new K("`$executeRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw\n", { clientVersion: this._clientVersion }); }); }
        $executeRawUnsafe(n, ...i) { return this._createPrismaPromise(o => (sn(this._activeProvider, n, i, "prisma.$executeRawUnsafe(<SQL>, [...values])"), this.$executeRawInternal(o, "$executeRawUnsafe", [n, ...i]))); }
        $runCommandRaw(n) { if (t.activeProvider !== "mongodb")
            throw new K(`The ${t.activeProvider} provider does not support $runCommandRaw. Use the mongodb provider.`, { clientVersion: this._clientVersion }); return this._createPrismaPromise(i => this._request({ args: n, clientMethod: "$runCommandRaw", dataPath: [], action: "runCommandRaw", argsMapper: xo, callsite: Re(this._errorFormat), transaction: i })); }
        async $queryRawInternal(n, i, o, s) { let a = this._activeProvider; return this._request({ action: "queryRaw", args: o, transaction: n, clientMethod: i, argsMapper: an({ clientMethod: i, activeProvider: a }), callsite: Re(this._errorFormat), dataPath: [], middlewareArgsMapper: s }); }
        $queryRaw(n, ...i) { return this._createPrismaPromise(o => { if (n.raw !== void 0 || n.sql !== void 0)
            return this.$queryRawInternal(o, "$queryRaw", ...Go(n, i)); throw new K("`$queryRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw\n", { clientVersion: this._clientVersion }); }); }
        $queryRawTyped(n) { return this._createPrismaPromise(i => { if (!this._hasPreviewFlag("typedSql"))
            throw new K("`typedSql` preview feature must be enabled in order to access $queryRawTyped API", { clientVersion: this._clientVersion }); return this.$queryRawInternal(i, "$queryRawTyped", n); }); }
        $queryRawUnsafe(n, ...i) { return this._createPrismaPromise(o => this.$queryRawInternal(o, "$queryRawUnsafe", [n, ...i])); }
        _transactionWithArray({ promises: n, options: i }) { let o = zl.nextId(), s = Mo(n.length), a = n.map((f, y) => { if (f?.[Symbol.toStringTag] !== "PrismaPromise")
            throw new Error("All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function."); let C = i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel, R = { kind: "batch", id: o, index: y, isolationLevel: C, lock: s }; return f.requestTransaction?.(R) ?? f; }); return Jo(a); }
        async _transactionWithCallback({ callback: n, options: i }) { let o = { traceparent: this._tracingHelper.getTraceParent() }, s = { maxWait: i?.maxWait ?? this._engineConfig.transactionOptions.maxWait, timeout: i?.timeout ?? this._engineConfig.transactionOptions.timeout, isolationLevel: i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel }, a = await this._engine.transaction("start", o, s), f; try {
            let y = { kind: "itx", ...a };
            f = await n(this._createItxClient(y)), await this._engine.transaction("commit", o, a);
        }
        catch (y) {
            throw await this._engine.transaction("rollback", o, a).catch(() => { }), y;
        } return f; }
        _createItxClient(n) { return le(Ct(le(Xi(this), [H("_appliedParent", () => this._appliedParent._createItxClient(n)), H("_createPrismaPromise", () => ln(n)), H(Hl, () => n.id)])), [et(no)]); }
        $transaction(n, i) { let o; typeof n == "function" ? this._engineConfig.adapter?.adapterName === "@prisma/adapter-d1" ? o = () => { throw new Error("Cloudflare D1 does not support interactive transactions. We recommend you to refactor your queries with that limitation in mind, and use batch transactions with `prisma.$transactions([])` where applicable."); } : o = () => this._transactionWithCallback({ callback: n, options: i }) : o = () => this._transactionWithArray({ promises: n, options: i }); let s = { name: "transaction", attributes: { method: "$transaction" } }; return this._tracingHelper.runInChildSpan(s, o); }
        _request(n) { n.otelParentCtx = this._tracingHelper.getActiveContext(); let i = n.middlewareArgsMapper ?? Kl, o = { args: i.requestArgsToMiddlewareArgs(n.args), dataPath: n.dataPath, runInTransaction: !!n.transaction, action: n.action, model: n.model }, s = { middleware: { name: "middleware", middleware: !0, attributes: { method: "$use" }, active: !1 }, operation: { name: "operation", attributes: { method: o.action, model: o.model, name: o.model ? `${o.model}.${o.action}` : o.action } } }, a = -1, f = async (y) => { let C = this._middlewares.get(++a); if (C)
            return this._tracingHelper.runInChildSpan(s.middleware, M => C(y, se => (M?.end(), f(se)))); let { runInTransaction: R, args: O, ...A } = y, I = { ...n, ...A }; O && (I.args = i.middlewareArgsToRequestArgs(O)), n.transaction !== void 0 && R === !1 && delete I.transaction; let k = await ao(this, I); return I.model ? ro({ result: k, modelName: I.model, args: I.args, extensions: this._extensions, runtimeDataModel: this._runtimeDataModel, globalOmit: this._globalOmit }) : k; }; return this._tracingHelper.runInChildSpan(s.operation, () => f(o)); }
        async _executeRequest({ args: n, clientMethod: i, dataPath: o, callsite: s, action: a, model: f, argsMapper: y, transaction: C, unpacker: R, otelParentCtx: O, customDataProxyFetch: A }) {
            try {
                n = y ? y(n) : n;
                let I = { name: "serialize" }, k = this._tracingHelper.runInChildSpan(I, () => nr({ modelName: f, runtimeDataModel: this._runtimeDataModel, action: a, args: n, clientMethod: i, callsite: s, extensions: this._extensions, errorFormat: this._errorFormat, clientVersion: this._clientVersion, previewFeatures: this._previewFeatures, globalOmit: this._globalOmit }));
                return G.enabled("prisma:client") && (Se("Prisma Client call:"), Se(`prisma.${i}(${Vi(n)})`), Se("Generated request:"), Se(JSON.stringify(k, null, 2) + `
`)), C?.kind === "batch" && await C.lock, this._requestHandler.request({ protocolQuery: k, modelName: f, action: a, clientMethod: i, dataPath: o, callsite: s, args: n, extensions: this._extensions, transaction: C, unpacker: R, otelParentCtx: O, otelChildCtx: this._tracingHelper.getActiveContext(), globalOmit: this._globalOmit, customDataProxyFetch: A });
            }
            catch (I) {
                throw I.clientVersion = this._clientVersion, I;
            }
        }
        _hasPreviewFlag(n) { return !!this._engineConfig.previewFeatures?.includes(n); }
        $applyPendingMigrations() { return this._engine.applyPendingMigrations(); }
    }
    return e;
}
function Go(t, e) { return Yl(t) ? [new ee(t, e), So] : [t, ko]; }
function Yl(t) { return Array.isArray(t) && Array.isArray(t.raw); }
u();
c();
m();
p();
d();
l();
var Xl = new Set(["toJSON", "$$typeof", "asymmetricMatch", Symbol.iterator, Symbol.toStringTag, Symbol.isConcatSpreadable, Symbol.toPrimitive]);
function Ho(t) { return new Proxy(t, { get(e, r) { if (r in e)
        return e[r]; if (!Xl.has(r))
        throw new TypeError(`Invalid enum value: ${String(r)}`); } }); }
u();
c();
m();
p();
d();
l();
l();
0 && (module.exports = { DMMF, Debug, Decimal, Extensions, MetricsClient, PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError, Public, Sql, createParam, defineDmmfProperty, deserializeJsonResponse, deserializeRawResult, dmmfToRuntimeDataModel, empty, getPrismaClient, getRuntime, join, makeStrictEnum, makeTypedQueryFactory, objectEnumValues, raw, serializeJsonQuery, skip, sqltag, warnEnvConflicts, warnOnce });
//# sourceMappingURL=wasm-engine-edge.js.map