"use strict";
var _Qt_e, _b, _Gt_e, _d, _Jt_e, _f;
var Ea = Object.create;
var rr = Object.defineProperty;
var xa = Object.getOwnPropertyDescriptor;
var Pa = Object.getOwnPropertyNames;
var va = Object.getPrototypeOf, Ta = Object.prototype.hasOwnProperty;
var he = (e, t) => () => (e && (t = e(e = 0)), t);
var Se = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Xe = (e, t) => { for (var r in t)
    rr(e, r, { get: t[r], enumerable: !0 }); }, oi = (e, t, r, n) => { if (t && typeof t == "object" || typeof t == "function")
    for (let i of Pa(t))
        !Ta.call(e, i) && i !== r && rr(e, i, { get: () => t[i], enumerable: !(n = xa(t, i)) || n.enumerable }); return e; };
var Re = (e, t, r) => (r = e != null ? Ea(va(e)) : {}, oi(t || !e || !e.__esModule ? rr(r, "default", { value: e, enumerable: !0 }) : r, e)), Ca = e => oi(rr({}, "__esModule", { value: !0 }), e);
var y, x, c = he(() => {
    "use strict";
    y = { nextTick: (e, ...t) => { setTimeout(() => { e(...t); }, 0); }, env: {}, version: "", cwd: () => "/", stderr: {}, argv: ["/bin/node"], pid: 1e4 }, { cwd: x } = y;
});
var P, p = he(() => {
    "use strict";
    P = globalThis.performance ?? (() => { let e = Date.now(); return { now: () => Date.now() - e }; })();
});
var E, d = he(() => {
    "use strict";
    E = () => { };
    E.prototype = E;
});
var b, m = he(() => {
    "use strict";
    b = class {
        constructor(t) { this.value = t; }
        deref() { return this.value; }
    };
});
var Ti = Se(nt => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
    var ci = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Aa = ci(e => {
        "use strict";
        e.byteLength = l, e.toByteArray = g, e.fromByteArray = k;
        var t = [], r = [], n = typeof Uint8Array < "u" ? Uint8Array : Array, i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for (o = 0, s = i.length; o < s; ++o)
            t[o] = i[o], r[i.charCodeAt(o)] = o;
        var o, s;
        r[45] = 62, r[95] = 63;
        function a(A) { var S = A.length; if (S % 4 > 0)
            throw new Error("Invalid string. Length must be a multiple of 4"); var I = A.indexOf("="); I === -1 && (I = S); var _ = I === S ? 0 : 4 - I % 4; return [I, _]; }
        function l(A) { var S = a(A), I = S[0], _ = S[1]; return (I + _) * 3 / 4 - _; }
        function u(A, S, I) { return (S + I) * 3 / 4 - I; }
        function g(A) { var S, I = a(A), _ = I[0], D = I[1], O = new n(u(A, _, D)), q = 0, Y = D > 0 ? _ - 4 : _, U; for (U = 0; U < Y; U += 4)
            S = r[A.charCodeAt(U)] << 18 | r[A.charCodeAt(U + 1)] << 12 | r[A.charCodeAt(U + 2)] << 6 | r[A.charCodeAt(U + 3)], O[q++] = S >> 16 & 255, O[q++] = S >> 8 & 255, O[q++] = S & 255; return D === 2 && (S = r[A.charCodeAt(U)] << 2 | r[A.charCodeAt(U + 1)] >> 4, O[q++] = S & 255), D === 1 && (S = r[A.charCodeAt(U)] << 10 | r[A.charCodeAt(U + 1)] << 4 | r[A.charCodeAt(U + 2)] >> 2, O[q++] = S >> 8 & 255, O[q++] = S & 255), O; }
        function h(A) { return t[A >> 18 & 63] + t[A >> 12 & 63] + t[A >> 6 & 63] + t[A & 63]; }
        function T(A, S, I) { for (var _, D = [], O = S; O < I; O += 3)
            _ = (A[O] << 16 & 16711680) + (A[O + 1] << 8 & 65280) + (A[O + 2] & 255), D.push(h(_)); return D.join(""); }
        function k(A) { for (var S, I = A.length, _ = I % 3, D = [], O = 16383, q = 0, Y = I - _; q < Y; q += O)
            D.push(T(A, q, q + O > Y ? Y : q + O)); return _ === 1 ? (S = A[I - 1], D.push(t[S >> 2] + t[S << 4 & 63] + "==")) : _ === 2 && (S = (A[I - 2] << 8) + A[I - 1], D.push(t[S >> 10] + t[S >> 4 & 63] + t[S << 2 & 63] + "=")), D.join(""); }
    }), Sa = ci(e => { e.read = function (t, r, n, i, o) { var s, a, l = o * 8 - i - 1, u = (1 << l) - 1, g = u >> 1, h = -7, T = n ? o - 1 : 0, k = n ? -1 : 1, A = t[r + T]; for (T += k, s = A & (1 << -h) - 1, A >>= -h, h += l; h > 0; s = s * 256 + t[r + T], T += k, h -= 8)
        ; for (a = s & (1 << -h) - 1, s >>= -h, h += i; h > 0; a = a * 256 + t[r + T], T += k, h -= 8)
        ; if (s === 0)
        s = 1 - g;
    else {
        if (s === u)
            return a ? NaN : (A ? -1 : 1) * (1 / 0);
        a = a + Math.pow(2, i), s = s - g;
    } return (A ? -1 : 1) * a * Math.pow(2, s - i); }, e.write = function (t, r, n, i, o, s) { var a, l, u, g = s * 8 - o - 1, h = (1 << g) - 1, T = h >> 1, k = o === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, A = i ? 0 : s - 1, S = i ? 1 : -1, I = r < 0 || r === 0 && 1 / r < 0 ? 1 : 0; for (r = Math.abs(r), isNaN(r) || r === 1 / 0 ? (l = isNaN(r) ? 1 : 0, a = h) : (a = Math.floor(Math.log(r) / Math.LN2), r * (u = Math.pow(2, -a)) < 1 && (a--, u *= 2), a + T >= 1 ? r += k / u : r += k * Math.pow(2, 1 - T), r * u >= 2 && (a++, u /= 2), a + T >= h ? (l = 0, a = h) : a + T >= 1 ? (l = (r * u - 1) * Math.pow(2, o), a = a + T) : (l = r * Math.pow(2, T - 1) * Math.pow(2, o), a = 0)); o >= 8; t[n + A] = l & 255, A += S, l /= 256, o -= 8)
        ; for (a = a << o | l, g += o; g > 0; t[n + A] = a & 255, A += S, a /= 256, g -= 8)
        ; t[n + A - S] |= I * 128; }; }), en = Aa(), tt = Sa(), si = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
    nt.Buffer = C;
    nt.SlowBuffer = Ma;
    nt.INSPECT_MAX_BYTES = 50;
    var nr = 2147483647;
    nt.kMaxLength = nr;
    C.TYPED_ARRAY_SUPPORT = Ra();
    !C.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
    function Ra() { try {
        let e = new Uint8Array(1), t = { foo: function () { return 42; } };
        return Object.setPrototypeOf(t, Uint8Array.prototype), Object.setPrototypeOf(e, t), e.foo() === 42;
    }
    catch {
        return !1;
    } }
    Object.defineProperty(C.prototype, "parent", { enumerable: !0, get: function () { if (C.isBuffer(this))
            return this.buffer; } });
    Object.defineProperty(C.prototype, "offset", { enumerable: !0, get: function () { if (C.isBuffer(this))
            return this.byteOffset; } });
    function ke(e) { if (e > nr)
        throw new RangeError('The value "' + e + '" is invalid for option "size"'); let t = new Uint8Array(e); return Object.setPrototypeOf(t, C.prototype), t; }
    function C(e, t, r) { if (typeof e == "number") {
        if (typeof t == "string")
            throw new TypeError('The "string" argument must be of type string. Received type number');
        return nn(e);
    } return pi(e, t, r); }
    C.poolSize = 8192;
    function pi(e, t, r) { if (typeof e == "string")
        return Oa(e, t); if (ArrayBuffer.isView(e))
        return Ia(e); if (e == null)
        throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e); if (ye(e, ArrayBuffer) || e && ye(e.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (ye(e, SharedArrayBuffer) || e && ye(e.buffer, SharedArrayBuffer)))
        return mi(e, t, r); if (typeof e == "number")
        throw new TypeError('The "value" argument must not be of type number. Received type number'); let n = e.valueOf && e.valueOf(); if (n != null && n !== e)
        return C.from(n, t, r); let i = Fa(e); if (i)
        return i; if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof e[Symbol.toPrimitive] == "function")
        return C.from(e[Symbol.toPrimitive]("string"), t, r); throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e); }
    C.from = function (e, t, r) { return pi(e, t, r); };
    Object.setPrototypeOf(C.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(C, Uint8Array);
    function di(e) { if (typeof e != "number")
        throw new TypeError('"size" argument must be of type number'); if (e < 0)
        throw new RangeError('The value "' + e + '" is invalid for option "size"'); }
    function ka(e, t, r) { return di(e), e <= 0 ? ke(e) : t !== void 0 ? typeof r == "string" ? ke(e).fill(t, r) : ke(e).fill(t) : ke(e); }
    C.alloc = function (e, t, r) { return ka(e, t, r); };
    function nn(e) { return di(e), ke(e < 0 ? 0 : on(e) | 0); }
    C.allocUnsafe = function (e) { return nn(e); };
    C.allocUnsafeSlow = function (e) { return nn(e); };
    function Oa(e, t) { if ((typeof t != "string" || t === "") && (t = "utf8"), !C.isEncoding(t))
        throw new TypeError("Unknown encoding: " + t); let r = fi(e, t) | 0, n = ke(r), i = n.write(e, t); return i !== r && (n = n.slice(0, i)), n; }
    function tn(e) { let t = e.length < 0 ? 0 : on(e.length) | 0, r = ke(t); for (let n = 0; n < t; n += 1)
        r[n] = e[n] & 255; return r; }
    function Ia(e) { if (ye(e, Uint8Array)) {
        let t = new Uint8Array(e);
        return mi(t.buffer, t.byteOffset, t.byteLength);
    } return tn(e); }
    function mi(e, t, r) { if (t < 0 || e.byteLength < t)
        throw new RangeError('"offset" is outside of buffer bounds'); if (e.byteLength < t + (r || 0))
        throw new RangeError('"length" is outside of buffer bounds'); let n; return t === void 0 && r === void 0 ? n = new Uint8Array(e) : r === void 0 ? n = new Uint8Array(e, t) : n = new Uint8Array(e, t, r), Object.setPrototypeOf(n, C.prototype), n; }
    function Fa(e) { if (C.isBuffer(e)) {
        let t = on(e.length) | 0, r = ke(t);
        return r.length === 0 || e.copy(r, 0, 0, t), r;
    } if (e.length !== void 0)
        return typeof e.length != "number" || an(e.length) ? ke(0) : tn(e); if (e.type === "Buffer" && Array.isArray(e.data))
        return tn(e.data); }
    function on(e) { if (e >= nr)
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + nr.toString(16) + " bytes"); return e | 0; }
    function Ma(e) { return +e != e && (e = 0), C.alloc(+e); }
    C.isBuffer = function (e) { return e != null && e._isBuffer === !0 && e !== C.prototype; };
    C.compare = function (e, t) { if (ye(e, Uint8Array) && (e = C.from(e, e.offset, e.byteLength)), ye(t, Uint8Array) && (t = C.from(t, t.offset, t.byteLength)), !C.isBuffer(e) || !C.isBuffer(t))
        throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'); if (e === t)
        return 0; let r = e.length, n = t.length; for (let i = 0, o = Math.min(r, n); i < o; ++i)
        if (e[i] !== t[i]) {
            r = e[i], n = t[i];
            break;
        } return r < n ? -1 : n < r ? 1 : 0; };
    C.isEncoding = function (e) { switch (String(e).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le": return !0;
        default: return !1;
    } };
    C.concat = function (e, t) { if (!Array.isArray(e))
        throw new TypeError('"list" argument must be an Array of Buffers'); if (e.length === 0)
        return C.alloc(0); let r; if (t === void 0)
        for (t = 0, r = 0; r < e.length; ++r)
            t += e[r].length; let n = C.allocUnsafe(t), i = 0; for (r = 0; r < e.length; ++r) {
        let o = e[r];
        if (ye(o, Uint8Array))
            i + o.length > n.length ? (C.isBuffer(o) || (o = C.from(o)), o.copy(n, i)) : Uint8Array.prototype.set.call(n, o, i);
        else if (C.isBuffer(o))
            o.copy(n, i);
        else
            throw new TypeError('"list" argument must be an Array of Buffers');
        i += o.length;
    } return n; };
    function fi(e, t) { if (C.isBuffer(e))
        return e.length; if (ArrayBuffer.isView(e) || ye(e, ArrayBuffer))
        return e.byteLength; if (typeof e != "string")
        throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof e); let r = e.length, n = arguments.length > 2 && arguments[2] === !0; if (!n && r === 0)
        return 0; let i = !1; for (;;)
        switch (t) {
            case "ascii":
            case "latin1":
            case "binary": return r;
            case "utf8":
            case "utf-8": return rn(e).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le": return r * 2;
            case "hex": return r >>> 1;
            case "base64": return vi(e).length;
            default:
                if (i)
                    return n ? -1 : rn(e).length;
                t = ("" + t).toLowerCase(), i = !0;
        } }
    C.byteLength = fi;
    function _a(e, t, r) { let n = !1; if ((t === void 0 || t < 0) && (t = 0), t > this.length || ((r === void 0 || r > this.length) && (r = this.length), r <= 0) || (r >>>= 0, t >>>= 0, r <= t))
        return ""; for (e || (e = "utf8");;)
        switch (e) {
            case "hex": return Qa(this, t, r);
            case "utf8":
            case "utf-8": return hi(this, t, r);
            case "ascii": return Ua(this, t, r);
            case "latin1":
            case "binary": return Va(this, t, r);
            case "base64": return Ba(this, t, r);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le": return Ga(this, t, r);
            default:
                if (n)
                    throw new TypeError("Unknown encoding: " + e);
                e = (e + "").toLowerCase(), n = !0;
        } }
    C.prototype._isBuffer = !0;
    function Ge(e, t, r) { let n = e[t]; e[t] = e[r], e[r] = n; }
    C.prototype.swap16 = function () { let e = this.length; if (e % 2 !== 0)
        throw new RangeError("Buffer size must be a multiple of 16-bits"); for (let t = 0; t < e; t += 2)
        Ge(this, t, t + 1); return this; };
    C.prototype.swap32 = function () { let e = this.length; if (e % 4 !== 0)
        throw new RangeError("Buffer size must be a multiple of 32-bits"); for (let t = 0; t < e; t += 4)
        Ge(this, t, t + 3), Ge(this, t + 1, t + 2); return this; };
    C.prototype.swap64 = function () { let e = this.length; if (e % 8 !== 0)
        throw new RangeError("Buffer size must be a multiple of 64-bits"); for (let t = 0; t < e; t += 8)
        Ge(this, t, t + 7), Ge(this, t + 1, t + 6), Ge(this, t + 2, t + 5), Ge(this, t + 3, t + 4); return this; };
    C.prototype.toString = function () { let e = this.length; return e === 0 ? "" : arguments.length === 0 ? hi(this, 0, e) : _a.apply(this, arguments); };
    C.prototype.toLocaleString = C.prototype.toString;
    C.prototype.equals = function (e) { if (!C.isBuffer(e))
        throw new TypeError("Argument must be a Buffer"); return this === e ? !0 : C.compare(this, e) === 0; };
    C.prototype.inspect = function () { let e = "", t = nt.INSPECT_MAX_BYTES; return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">"; };
    si && (C.prototype[si] = C.prototype.inspect);
    C.prototype.compare = function (e, t, r, n, i) { if (ye(e, Uint8Array) && (e = C.from(e, e.offset, e.byteLength)), !C.isBuffer(e))
        throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e); if (t === void 0 && (t = 0), r === void 0 && (r = e ? e.length : 0), n === void 0 && (n = 0), i === void 0 && (i = this.length), t < 0 || r > e.length || n < 0 || i > this.length)
        throw new RangeError("out of range index"); if (n >= i && t >= r)
        return 0; if (n >= i)
        return -1; if (t >= r)
        return 1; if (t >>>= 0, r >>>= 0, n >>>= 0, i >>>= 0, this === e)
        return 0; let o = i - n, s = r - t, a = Math.min(o, s), l = this.slice(n, i), u = e.slice(t, r); for (let g = 0; g < a; ++g)
        if (l[g] !== u[g]) {
            o = l[g], s = u[g];
            break;
        } return o < s ? -1 : s < o ? 1 : 0; };
    function gi(e, t, r, n, i) { if (e.length === 0)
        return -1; if (typeof r == "string" ? (n = r, r = 0) : r > 2147483647 ? r = 2147483647 : r < -2147483648 && (r = -2147483648), r = +r, an(r) && (r = i ? 0 : e.length - 1), r < 0 && (r = e.length + r), r >= e.length) {
        if (i)
            return -1;
        r = e.length - 1;
    }
    else if (r < 0)
        if (i)
            r = 0;
        else
            return -1; if (typeof t == "string" && (t = C.from(t, n)), C.isBuffer(t))
        return t.length === 0 ? -1 : ai(e, t, r, n, i); if (typeof t == "number")
        return t = t & 255, typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(e, t, r) : Uint8Array.prototype.lastIndexOf.call(e, t, r) : ai(e, [t], r, n, i); throw new TypeError("val must be string, number or Buffer"); }
    function ai(e, t, r, n, i) { let o = 1, s = e.length, a = t.length; if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
        if (e.length < 2 || t.length < 2)
            return -1;
        o = 2, s /= 2, a /= 2, r /= 2;
    } function l(g, h) { return o === 1 ? g[h] : g.readUInt16BE(h * o); } let u; if (i) {
        let g = -1;
        for (u = r; u < s; u++)
            if (l(e, u) === l(t, g === -1 ? 0 : u - g)) {
                if (g === -1 && (g = u), u - g + 1 === a)
                    return g * o;
            }
            else
                g !== -1 && (u -= u - g), g = -1;
    }
    else
        for (r + a > s && (r = s - a), u = r; u >= 0; u--) {
            let g = !0;
            for (let h = 0; h < a; h++)
                if (l(e, u + h) !== l(t, h)) {
                    g = !1;
                    break;
                }
            if (g)
                return u;
        } return -1; }
    C.prototype.includes = function (e, t, r) { return this.indexOf(e, t, r) !== -1; };
    C.prototype.indexOf = function (e, t, r) { return gi(this, e, t, r, !0); };
    C.prototype.lastIndexOf = function (e, t, r) { return gi(this, e, t, r, !1); };
    function La(e, t, r, n) { r = Number(r) || 0; let i = e.length - r; n ? (n = Number(n), n > i && (n = i)) : n = i; let o = t.length; n > o / 2 && (n = o / 2); let s; for (s = 0; s < n; ++s) {
        let a = parseInt(t.substr(s * 2, 2), 16);
        if (an(a))
            return s;
        e[r + s] = a;
    } return s; }
    function Da(e, t, r, n) { return ir(rn(t, e.length - r), e, r, n); }
    function Na(e, t, r, n) { return ir(Ha(t), e, r, n); }
    function qa(e, t, r, n) { return ir(vi(t), e, r, n); }
    function $a(e, t, r, n) { return ir(za(t, e.length - r), e, r, n); }
    C.prototype.write = function (e, t, r, n) { if (t === void 0)
        n = "utf8", r = this.length, t = 0;
    else if (r === void 0 && typeof t == "string")
        n = t, r = this.length, t = 0;
    else if (isFinite(t))
        t = t >>> 0, isFinite(r) ? (r = r >>> 0, n === void 0 && (n = "utf8")) : (n = r, r = void 0);
    else
        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported"); let i = this.length - t; if ((r === void 0 || r > i) && (r = i), e.length > 0 && (r < 0 || t < 0) || t > this.length)
        throw new RangeError("Attempt to write outside buffer bounds"); n || (n = "utf8"); let o = !1; for (;;)
        switch (n) {
            case "hex": return La(this, e, t, r);
            case "utf8":
            case "utf-8": return Da(this, e, t, r);
            case "ascii":
            case "latin1":
            case "binary": return Na(this, e, t, r);
            case "base64": return qa(this, e, t, r);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le": return $a(this, e, t, r);
            default:
                if (o)
                    throw new TypeError("Unknown encoding: " + n);
                n = ("" + n).toLowerCase(), o = !0;
        } };
    C.prototype.toJSON = function () { return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) }; };
    function Ba(e, t, r) { return t === 0 && r === e.length ? en.fromByteArray(e) : en.fromByteArray(e.slice(t, r)); }
    function hi(e, t, r) { r = Math.min(e.length, r); let n = [], i = t; for (; i < r;) {
        let o = e[i], s = null, a = o > 239 ? 4 : o > 223 ? 3 : o > 191 ? 2 : 1;
        if (i + a <= r) {
            let l, u, g, h;
            switch (a) {
                case 1:
                    o < 128 && (s = o);
                    break;
                case 2:
                    l = e[i + 1], (l & 192) === 128 && (h = (o & 31) << 6 | l & 63, h > 127 && (s = h));
                    break;
                case 3:
                    l = e[i + 1], u = e[i + 2], (l & 192) === 128 && (u & 192) === 128 && (h = (o & 15) << 12 | (l & 63) << 6 | u & 63, h > 2047 && (h < 55296 || h > 57343) && (s = h));
                    break;
                case 4: l = e[i + 1], u = e[i + 2], g = e[i + 3], (l & 192) === 128 && (u & 192) === 128 && (g & 192) === 128 && (h = (o & 15) << 18 | (l & 63) << 12 | (u & 63) << 6 | g & 63, h > 65535 && h < 1114112 && (s = h));
            }
        }
        s === null ? (s = 65533, a = 1) : s > 65535 && (s -= 65536, n.push(s >>> 10 & 1023 | 55296), s = 56320 | s & 1023), n.push(s), i += a;
    } return ja(n); }
    var li = 4096;
    function ja(e) { let t = e.length; if (t <= li)
        return String.fromCharCode.apply(String, e); let r = "", n = 0; for (; n < t;)
        r += String.fromCharCode.apply(String, e.slice(n, n += li)); return r; }
    function Ua(e, t, r) { let n = ""; r = Math.min(e.length, r); for (let i = t; i < r; ++i)
        n += String.fromCharCode(e[i] & 127); return n; }
    function Va(e, t, r) { let n = ""; r = Math.min(e.length, r); for (let i = t; i < r; ++i)
        n += String.fromCharCode(e[i]); return n; }
    function Qa(e, t, r) { let n = e.length; (!t || t < 0) && (t = 0), (!r || r < 0 || r > n) && (r = n); let i = ""; for (let o = t; o < r; ++o)
        i += Ya[e[o]]; return i; }
    function Ga(e, t, r) { let n = e.slice(t, r), i = ""; for (let o = 0; o < n.length - 1; o += 2)
        i += String.fromCharCode(n[o] + n[o + 1] * 256); return i; }
    C.prototype.slice = function (e, t) { let r = this.length; e = ~~e, t = t === void 0 ? r : ~~t, e < 0 ? (e += r, e < 0 && (e = 0)) : e > r && (e = r), t < 0 ? (t += r, t < 0 && (t = 0)) : t > r && (t = r), t < e && (t = e); let n = this.subarray(e, t); return Object.setPrototypeOf(n, C.prototype), n; };
    function K(e, t, r) { if (e % 1 !== 0 || e < 0)
        throw new RangeError("offset is not uint"); if (e + t > r)
        throw new RangeError("Trying to access beyond buffer length"); }
    C.prototype.readUintLE = C.prototype.readUIntLE = function (e, t, r) { e = e >>> 0, t = t >>> 0, r || K(e, t, this.length); let n = this[e], i = 1, o = 0; for (; ++o < t && (i *= 256);)
        n += this[e + o] * i; return n; };
    C.prototype.readUintBE = C.prototype.readUIntBE = function (e, t, r) { e = e >>> 0, t = t >>> 0, r || K(e, t, this.length); let n = this[e + --t], i = 1; for (; t > 0 && (i *= 256);)
        n += this[e + --t] * i; return n; };
    C.prototype.readUint8 = C.prototype.readUInt8 = function (e, t) { return e = e >>> 0, t || K(e, 1, this.length), this[e]; };
    C.prototype.readUint16LE = C.prototype.readUInt16LE = function (e, t) { return e = e >>> 0, t || K(e, 2, this.length), this[e] | this[e + 1] << 8; };
    C.prototype.readUint16BE = C.prototype.readUInt16BE = function (e, t) { return e = e >>> 0, t || K(e, 2, this.length), this[e] << 8 | this[e + 1]; };
    C.prototype.readUint32LE = C.prototype.readUInt32LE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216; };
    C.prototype.readUint32BE = C.prototype.readUInt32BE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]); };
    C.prototype.readBigUInt64LE = De(function (e) { e = e >>> 0, rt(e, "offset"); let t = this[e], r = this[e + 7]; (t === void 0 || r === void 0) && At(e, this.length - 8); let n = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, i = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + r * 2 ** 24; return BigInt(n) + (BigInt(i) << BigInt(32)); });
    C.prototype.readBigUInt64BE = De(function (e) { e = e >>> 0, rt(e, "offset"); let t = this[e], r = this[e + 7]; (t === void 0 || r === void 0) && At(e, this.length - 8); let n = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], i = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + r; return (BigInt(n) << BigInt(32)) + BigInt(i); });
    C.prototype.readIntLE = function (e, t, r) { e = e >>> 0, t = t >>> 0, r || K(e, t, this.length); let n = this[e], i = 1, o = 0; for (; ++o < t && (i *= 256);)
        n += this[e + o] * i; return i *= 128, n >= i && (n -= Math.pow(2, 8 * t)), n; };
    C.prototype.readIntBE = function (e, t, r) { e = e >>> 0, t = t >>> 0, r || K(e, t, this.length); let n = t, i = 1, o = this[e + --n]; for (; n > 0 && (i *= 256);)
        o += this[e + --n] * i; return i *= 128, o >= i && (o -= Math.pow(2, 8 * t)), o; };
    C.prototype.readInt8 = function (e, t) { return e = e >>> 0, t || K(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e]; };
    C.prototype.readInt16LE = function (e, t) { e = e >>> 0, t || K(e, 2, this.length); let r = this[e] | this[e + 1] << 8; return r & 32768 ? r | 4294901760 : r; };
    C.prototype.readInt16BE = function (e, t) { e = e >>> 0, t || K(e, 2, this.length); let r = this[e + 1] | this[e] << 8; return r & 32768 ? r | 4294901760 : r; };
    C.prototype.readInt32LE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24; };
    C.prototype.readInt32BE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]; };
    C.prototype.readBigInt64LE = De(function (e) { e = e >>> 0, rt(e, "offset"); let t = this[e], r = this[e + 7]; (t === void 0 || r === void 0) && At(e, this.length - 8); let n = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (r << 24); return (BigInt(n) << BigInt(32)) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24); });
    C.prototype.readBigInt64BE = De(function (e) { e = e >>> 0, rt(e, "offset"); let t = this[e], r = this[e + 7]; (t === void 0 || r === void 0) && At(e, this.length - 8); let n = (t << 24) + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e]; return (BigInt(n) << BigInt(32)) + BigInt(this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + r); });
    C.prototype.readFloatLE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), tt.read(this, e, !0, 23, 4); };
    C.prototype.readFloatBE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), tt.read(this, e, !1, 23, 4); };
    C.prototype.readDoubleLE = function (e, t) { return e = e >>> 0, t || K(e, 8, this.length), tt.read(this, e, !0, 52, 8); };
    C.prototype.readDoubleBE = function (e, t) { return e = e >>> 0, t || K(e, 8, this.length), tt.read(this, e, !1, 52, 8); };
    function oe(e, t, r, n, i, o) { if (!C.isBuffer(e))
        throw new TypeError('"buffer" argument must be a Buffer instance'); if (t > i || t < o)
        throw new RangeError('"value" argument is out of bounds'); if (r + n > e.length)
        throw new RangeError("Index out of range"); }
    C.prototype.writeUintLE = C.prototype.writeUIntLE = function (e, t, r, n) { if (e = +e, t = t >>> 0, r = r >>> 0, !n) {
        let s = Math.pow(2, 8 * r) - 1;
        oe(this, e, t, r, s, 0);
    } let i = 1, o = 0; for (this[t] = e & 255; ++o < r && (i *= 256);)
        this[t + o] = e / i & 255; return t + r; };
    C.prototype.writeUintBE = C.prototype.writeUIntBE = function (e, t, r, n) { if (e = +e, t = t >>> 0, r = r >>> 0, !n) {
        let s = Math.pow(2, 8 * r) - 1;
        oe(this, e, t, r, s, 0);
    } let i = r - 1, o = 1; for (this[t + i] = e & 255; --i >= 0 && (o *= 256);)
        this[t + i] = e / o & 255; return t + r; };
    C.prototype.writeUint8 = C.prototype.writeUInt8 = function (e, t, r) { return e = +e, t = t >>> 0, r || oe(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1; };
    C.prototype.writeUint16LE = C.prototype.writeUInt16LE = function (e, t, r) { return e = +e, t = t >>> 0, r || oe(this, e, t, 2, 65535, 0), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2; };
    C.prototype.writeUint16BE = C.prototype.writeUInt16BE = function (e, t, r) { return e = +e, t = t >>> 0, r || oe(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2; };
    C.prototype.writeUint32LE = C.prototype.writeUInt32LE = function (e, t, r) { return e = +e, t = t >>> 0, r || oe(this, e, t, 4, 4294967295, 0), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4; };
    C.prototype.writeUint32BE = C.prototype.writeUInt32BE = function (e, t, r) { return e = +e, t = t >>> 0, r || oe(this, e, t, 4, 4294967295, 0), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4; };
    function yi(e, t, r, n, i) { Pi(t, n, i, e, r, 7); let o = Number(t & BigInt(4294967295)); e[r++] = o, o = o >> 8, e[r++] = o, o = o >> 8, e[r++] = o, o = o >> 8, e[r++] = o; let s = Number(t >> BigInt(32) & BigInt(4294967295)); return e[r++] = s, s = s >> 8, e[r++] = s, s = s >> 8, e[r++] = s, s = s >> 8, e[r++] = s, r; }
    function wi(e, t, r, n, i) { Pi(t, n, i, e, r, 7); let o = Number(t & BigInt(4294967295)); e[r + 7] = o, o = o >> 8, e[r + 6] = o, o = o >> 8, e[r + 5] = o, o = o >> 8, e[r + 4] = o; let s = Number(t >> BigInt(32) & BigInt(4294967295)); return e[r + 3] = s, s = s >> 8, e[r + 2] = s, s = s >> 8, e[r + 1] = s, s = s >> 8, e[r] = s, r + 8; }
    C.prototype.writeBigUInt64LE = De(function (e, t = 0) { return yi(this, e, t, BigInt(0), BigInt("0xffffffffffffffff")); });
    C.prototype.writeBigUInt64BE = De(function (e, t = 0) { return wi(this, e, t, BigInt(0), BigInt("0xffffffffffffffff")); });
    C.prototype.writeIntLE = function (e, t, r, n) { if (e = +e, t = t >>> 0, !n) {
        let a = Math.pow(2, 8 * r - 1);
        oe(this, e, t, r, a - 1, -a);
    } let i = 0, o = 1, s = 0; for (this[t] = e & 255; ++i < r && (o *= 256);)
        e < 0 && s === 0 && this[t + i - 1] !== 0 && (s = 1), this[t + i] = (e / o >> 0) - s & 255; return t + r; };
    C.prototype.writeIntBE = function (e, t, r, n) { if (e = +e, t = t >>> 0, !n) {
        let a = Math.pow(2, 8 * r - 1);
        oe(this, e, t, r, a - 1, -a);
    } let i = r - 1, o = 1, s = 0; for (this[t + i] = e & 255; --i >= 0 && (o *= 256);)
        e < 0 && s === 0 && this[t + i + 1] !== 0 && (s = 1), this[t + i] = (e / o >> 0) - s & 255; return t + r; };
    C.prototype.writeInt8 = function (e, t, r) { return e = +e, t = t >>> 0, r || oe(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1; };
    C.prototype.writeInt16LE = function (e, t, r) { return e = +e, t = t >>> 0, r || oe(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2; };
    C.prototype.writeInt16BE = function (e, t, r) { return e = +e, t = t >>> 0, r || oe(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2; };
    C.prototype.writeInt32LE = function (e, t, r) { return e = +e, t = t >>> 0, r || oe(this, e, t, 4, 2147483647, -2147483648), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4; };
    C.prototype.writeInt32BE = function (e, t, r) { return e = +e, t = t >>> 0, r || oe(this, e, t, 4, 2147483647, -2147483648), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4; };
    C.prototype.writeBigInt64LE = De(function (e, t = 0) { return yi(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff")); });
    C.prototype.writeBigInt64BE = De(function (e, t = 0) { return wi(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff")); });
    function bi(e, t, r, n, i, o) { if (r + n > e.length)
        throw new RangeError("Index out of range"); if (r < 0)
        throw new RangeError("Index out of range"); }
    function Ei(e, t, r, n, i) { return t = +t, r = r >>> 0, i || bi(e, t, r, 4, 34028234663852886e22, -34028234663852886e22), tt.write(e, t, r, n, 23, 4), r + 4; }
    C.prototype.writeFloatLE = function (e, t, r) { return Ei(this, e, t, !0, r); };
    C.prototype.writeFloatBE = function (e, t, r) { return Ei(this, e, t, !1, r); };
    function xi(e, t, r, n, i) { return t = +t, r = r >>> 0, i || bi(e, t, r, 8, 17976931348623157e292, -17976931348623157e292), tt.write(e, t, r, n, 52, 8), r + 8; }
    C.prototype.writeDoubleLE = function (e, t, r) { return xi(this, e, t, !0, r); };
    C.prototype.writeDoubleBE = function (e, t, r) { return xi(this, e, t, !1, r); };
    C.prototype.copy = function (e, t, r, n) { if (!C.isBuffer(e))
        throw new TypeError("argument should be a Buffer"); if (r || (r = 0), !n && n !== 0 && (n = this.length), t >= e.length && (t = e.length), t || (t = 0), n > 0 && n < r && (n = r), n === r || e.length === 0 || this.length === 0)
        return 0; if (t < 0)
        throw new RangeError("targetStart out of bounds"); if (r < 0 || r >= this.length)
        throw new RangeError("Index out of range"); if (n < 0)
        throw new RangeError("sourceEnd out of bounds"); n > this.length && (n = this.length), e.length - t < n - r && (n = e.length - t + r); let i = n - r; return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, r, n) : Uint8Array.prototype.set.call(e, this.subarray(r, n), t), i; };
    C.prototype.fill = function (e, t, r, n) { if (typeof e == "string") {
        if (typeof t == "string" ? (n = t, t = 0, r = this.length) : typeof r == "string" && (n = r, r = this.length), n !== void 0 && typeof n != "string")
            throw new TypeError("encoding must be a string");
        if (typeof n == "string" && !C.isEncoding(n))
            throw new TypeError("Unknown encoding: " + n);
        if (e.length === 1) {
            let o = e.charCodeAt(0);
            (n === "utf8" && o < 128 || n === "latin1") && (e = o);
        }
    }
    else
        typeof e == "number" ? e = e & 255 : typeof e == "boolean" && (e = Number(e)); if (t < 0 || this.length < t || this.length < r)
        throw new RangeError("Out of range index"); if (r <= t)
        return this; t = t >>> 0, r = r === void 0 ? this.length : r >>> 0, e || (e = 0); let i; if (typeof e == "number")
        for (i = t; i < r; ++i)
            this[i] = e;
    else {
        let o = C.isBuffer(e) ? e : C.from(e, n), s = o.length;
        if (s === 0)
            throw new TypeError('The value "' + e + '" is invalid for argument "value"');
        for (i = 0; i < r - t; ++i)
            this[i + t] = o[i % s];
    } return this; };
    var et = {};
    function sn(e, t, r) { et[e] = class extends r {
        constructor() { super(), Object.defineProperty(this, "message", { value: t.apply(this, arguments), writable: !0, configurable: !0 }), this.name = `${this.name} [${e}]`, this.stack, delete this.name; }
        get code() { return e; }
        set code(n) { Object.defineProperty(this, "code", { configurable: !0, enumerable: !0, value: n, writable: !0 }); }
        toString() { return `${this.name} [${e}]: ${this.message}`; }
    }; }
    sn("ERR_BUFFER_OUT_OF_BOUNDS", function (e) { return e ? `${e} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds"; }, RangeError);
    sn("ERR_INVALID_ARG_TYPE", function (e, t) { return `The "${e}" argument must be of type number. Received type ${typeof t}`; }, TypeError);
    sn("ERR_OUT_OF_RANGE", function (e, t, r) { let n = `The value of "${e}" is out of range.`, i = r; return Number.isInteger(r) && Math.abs(r) > 2 ** 32 ? i = ui(String(r)) : typeof r == "bigint" && (i = String(r), (r > BigInt(2) ** BigInt(32) || r < -(BigInt(2) ** BigInt(32))) && (i = ui(i)), i += "n"), n += ` It must be ${t}. Received ${i}`, n; }, RangeError);
    function ui(e) { let t = "", r = e.length, n = e[0] === "-" ? 1 : 0; for (; r >= n + 4; r -= 3)
        t = `_${e.slice(r - 3, r)}${t}`; return `${e.slice(0, r)}${t}`; }
    function Ja(e, t, r) { rt(t, "offset"), (e[t] === void 0 || e[t + r] === void 0) && At(t, e.length - (r + 1)); }
    function Pi(e, t, r, n, i, o) { if (e > r || e < t) {
        let s = typeof t == "bigint" ? "n" : "", a;
        throw o > 3 ? t === 0 || t === BigInt(0) ? a = `>= 0${s} and < 2${s} ** ${(o + 1) * 8}${s}` : a = `>= -(2${s} ** ${(o + 1) * 8 - 1}${s}) and < 2 ** ${(o + 1) * 8 - 1}${s}` : a = `>= ${t}${s} and <= ${r}${s}`, new et.ERR_OUT_OF_RANGE("value", a, e);
    } Ja(n, i, o); }
    function rt(e, t) { if (typeof e != "number")
        throw new et.ERR_INVALID_ARG_TYPE(t, "number", e); }
    function At(e, t, r) { throw Math.floor(e) !== e ? (rt(e, r), new et.ERR_OUT_OF_RANGE(r || "offset", "an integer", e)) : t < 0 ? new et.ERR_BUFFER_OUT_OF_BOUNDS : new et.ERR_OUT_OF_RANGE(r || "offset", `>= ${r ? 1 : 0} and <= ${t}`, e); }
    var Wa = /[^+/0-9A-Za-z-_]/g;
    function Ka(e) { if (e = e.split("=")[0], e = e.trim().replace(Wa, ""), e.length < 2)
        return ""; for (; e.length % 4 !== 0;)
        e = e + "="; return e; }
    function rn(e, t) { t = t || 1 / 0; let r, n = e.length, i = null, o = []; for (let s = 0; s < n; ++s) {
        if (r = e.charCodeAt(s), r > 55295 && r < 57344) {
            if (!i) {
                if (r > 56319) {
                    (t -= 3) > -1 && o.push(239, 191, 189);
                    continue;
                }
                else if (s + 1 === n) {
                    (t -= 3) > -1 && o.push(239, 191, 189);
                    continue;
                }
                i = r;
                continue;
            }
            if (r < 56320) {
                (t -= 3) > -1 && o.push(239, 191, 189), i = r;
                continue;
            }
            r = (i - 55296 << 10 | r - 56320) + 65536;
        }
        else
            i && (t -= 3) > -1 && o.push(239, 191, 189);
        if (i = null, r < 128) {
            if ((t -= 1) < 0)
                break;
            o.push(r);
        }
        else if (r < 2048) {
            if ((t -= 2) < 0)
                break;
            o.push(r >> 6 | 192, r & 63 | 128);
        }
        else if (r < 65536) {
            if ((t -= 3) < 0)
                break;
            o.push(r >> 12 | 224, r >> 6 & 63 | 128, r & 63 | 128);
        }
        else if (r < 1114112) {
            if ((t -= 4) < 0)
                break;
            o.push(r >> 18 | 240, r >> 12 & 63 | 128, r >> 6 & 63 | 128, r & 63 | 128);
        }
        else
            throw new Error("Invalid code point");
    } return o; }
    function Ha(e) { let t = []; for (let r = 0; r < e.length; ++r)
        t.push(e.charCodeAt(r) & 255); return t; }
    function za(e, t) { let r, n, i, o = []; for (let s = 0; s < e.length && !((t -= 2) < 0); ++s)
        r = e.charCodeAt(s), n = r >> 8, i = r % 256, o.push(i), o.push(n); return o; }
    function vi(e) { return en.toByteArray(Ka(e)); }
    function ir(e, t, r, n) { let i; for (i = 0; i < n && !(i + r >= t.length || i >= e.length); ++i)
        t[i + r] = e[i]; return i; }
    function ye(e, t) { return e instanceof t || e != null && e.constructor != null && e.constructor.name != null && e.constructor.name === t.name; }
    function an(e) { return e !== e; }
    var Ya = function () { let e = "0123456789abcdef", t = new Array(256); for (let r = 0; r < 16; ++r) {
        let n = r * 16;
        for (let i = 0; i < 16; ++i)
            t[n + i] = e[r] + e[i];
    } return t; }();
    function De(e) { return typeof BigInt > "u" ? Za : e; }
    function Za() { throw new Error("BigInt not supported"); }
});
var w, f = he(() => {
    "use strict";
    w = Re(Ti());
});
function El() { return !1; }
function dn() { return { dev: 0, ino: 0, mode: 0, nlink: 0, uid: 0, gid: 0, rdev: 0, size: 0, blksize: 0, blocks: 0, atimeMs: 0, mtimeMs: 0, ctimeMs: 0, birthtimeMs: 0, atime: new Date, mtime: new Date, ctime: new Date, birthtime: new Date }; }
function xl() { return dn(); }
function Pl() { return []; }
function vl(e) { e(null, []); }
function Tl() { return ""; }
function Cl() { return ""; }
function Al() { }
function Sl() { }
function Rl() { }
function kl() { }
function Ol() { }
function Il() { }
function Fl() { }
function Ml() { }
function _l() { return { close: () => { }, on: () => { }, removeAllListeners: () => { } }; }
function Ll(e, t) { t(null, dn()); }
var Dl, Nl, sr, mn = he(() => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
    Dl = {}, Nl = { existsSync: El, lstatSync: dn, stat: Ll, statSync: xl, readdirSync: Pl, readdir: vl, readlinkSync: Tl, realpathSync: Cl, chmodSync: Al, renameSync: Sl, mkdirSync: Rl, rmdirSync: kl, rmSync: Ol, unlinkSync: Il, watchFile: Fl, unwatchFile: Ml, watch: _l, promises: Dl }, sr = Nl;
});
function ql(...e) { return e.join("/"); }
function $l(...e) { return e.join("/"); }
function Bl(e) { let t = Ni(e), r = qi(e), [n, i] = t.split("."); return { root: "/", dir: r, base: t, ext: i, name: n }; }
function Ni(e) { let t = e.split("/"); return t[t.length - 1]; }
function qi(e) { return e.split("/").slice(0, -1).join("/"); }
function Ul(e) { let t = e.split("/").filter(i => i !== "" && i !== "."), r = []; for (let i of t)
    i === ".." ? r.pop() : r.push(i); let n = r.join("/"); return e.startsWith("/") ? "/" + n : n; }
var $i, jl, Vl, Ql, Ie, gn = he(() => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
    $i = "/", jl = ":";
    Vl = { sep: $i }, Ql = { basename: Ni, delimiter: jl, dirname: qi, join: $l, normalize: Ul, parse: Bl, posix: Vl, resolve: ql, sep: $i }, Ie = Ql;
});
var Bi = Se(($m, Gl) => { Gl.exports = { name: "@prisma/internals", version: "6.13.0", description: "This package is intended for Prisma's internal use", main: "dist/index.js", types: "dist/index.d.ts", repository: { type: "git", url: "https://github.com/prisma/prisma.git", directory: "packages/internals" }, homepage: "https://www.prisma.io", author: "Tim Suchanek <suchanek@prisma.io>", bugs: "https://github.com/prisma/prisma/issues", license: "Apache-2.0", scripts: { dev: "DEV=true tsx helpers/build.ts", build: "tsx helpers/build.ts", test: "dotenv -e ../../.db.env -- jest --silent", prepublishOnly: "pnpm run build" }, files: ["README.md", "dist", "!**/libquery_engine*", "!dist/get-generators/engines/*", "scripts"], devDependencies: { "@babel/helper-validator-identifier": "7.25.9", "@opentelemetry/api": "1.9.0", "@swc/core": "1.11.5", "@swc/jest": "0.2.37", "@types/babel__helper-validator-identifier": "7.15.2", "@types/jest": "29.5.14", "@types/node": "18.19.76", "@types/resolve": "1.20.6", archiver: "6.0.2", "checkpoint-client": "1.1.33", "cli-truncate": "4.0.0", dotenv: "16.5.0", esbuild: "0.25.5", "escape-string-regexp": "5.0.0", execa: "5.1.1", "fast-glob": "3.3.3", "find-up": "7.0.0", "fp-ts": "2.16.9", "fs-extra": "11.3.0", "fs-jetpack": "5.1.0", "global-dirs": "4.0.0", globby: "11.1.0", "identifier-regex": "1.0.0", "indent-string": "4.0.0", "is-windows": "1.0.2", "is-wsl": "3.1.0", jest: "29.7.0", "jest-junit": "16.0.0", kleur: "4.1.5", "mock-stdin": "1.0.0", "new-github-issue-url": "0.2.1", "node-fetch": "3.3.2", "npm-packlist": "5.1.3", open: "7.4.2", "p-map": "4.0.0", "read-package-up": "11.0.0", resolve: "1.22.10", "string-width": "7.2.0", "strip-ansi": "6.0.1", "strip-indent": "4.0.0", "temp-dir": "2.0.0", tempy: "1.0.1", "terminal-link": "4.0.0", tmp: "0.2.3", "ts-node": "10.9.2", "ts-pattern": "5.6.2", "ts-toolbelt": "9.6.0", typescript: "5.4.5", yarn: "1.22.22" }, dependencies: { "@prisma/config": "workspace:*", "@prisma/debug": "workspace:*", "@prisma/dmmf": "workspace:*", "@prisma/driver-adapter-utils": "workspace:*", "@prisma/engines": "workspace:*", "@prisma/fetch-engine": "workspace:*", "@prisma/generator": "workspace:*", "@prisma/generator-helper": "workspace:*", "@prisma/get-platform": "workspace:*", "@prisma/prisma-schema-wasm": "6.13.0-35.361e86d0ea4987e9f53a565309b3eed797a6bcbd", "@prisma/schema-engine-wasm": "6.13.0-35.361e86d0ea4987e9f53a565309b3eed797a6bcbd", "@prisma/schema-files-loader": "workspace:*", arg: "5.0.2", prompts: "2.4.2" }, peerDependencies: { typescript: ">=5.1.0" }, peerDependenciesMeta: { typescript: { optional: !0 } }, sideEffects: !1 }; });
var Vi = Se((qf, Ui) => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
    Ui.exports = e => { let t = e.match(/^[ \t]*(?=\S)/gm); return t ? t.reduce((r, n) => Math.min(r, n.length), 1 / 0) : 0; };
});
var Ki = Se((rg, Wi) => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
    Wi.exports = (e, t = 1, r) => { if (r = { indent: " ", includeEmptyLines: !1, ...r }, typeof e != "string")
        throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof e}\``); if (typeof t != "number")
        throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof t}\``); if (typeof r.indent != "string")
        throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof r.indent}\``); if (t === 0)
        return e; let n = r.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm; return e.replace(n, r.indent.repeat(t)); };
});
var Yi = Se((fg, zi) => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
    zi.exports = ({ onlyFirst: e = !1 } = {}) => { let t = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|"); return new RegExp(t, e ? void 0 : "g"); };
});
var Pn = Se((Eg, Zi) => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
    var tu = Yi();
    Zi.exports = e => typeof e == "string" ? e.replace(tu(), "") : e;
});
var Xi = Se((Gg, cr) => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
    cr.exports = (e = {}) => { let t; if (e.repoUrl)
        t = e.repoUrl;
    else if (e.user && e.repo)
        t = `https://github.com/${e.user}/${e.repo}`;
    else
        throw new Error("You need to specify either the `repoUrl` option or both the `user` and `repo` options"); let r = new URL(`${t}/issues/new`), n = ["body", "title", "labels", "template", "milestone", "assignee", "projects"]; for (let i of n) {
        let o = e[i];
        if (o !== void 0) {
            if (i === "labels" || i === "projects") {
                if (!Array.isArray(o))
                    throw new TypeError(`The \`${i}\` option should be an array`);
                o = o.join(",");
            }
            r.searchParams.set(i, o);
        }
    } return r.toString(); };
    cr.exports.default = cr.exports;
});
var Fn = Se((g0, vo) => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
    vo.exports = function () { function e(t, r, n, i, o) { return t < r || n < r ? t > n ? n + 1 : t + 1 : i === o ? r : r + 1; } return function (t, r) { if (t === r)
        return 0; if (t.length > r.length) {
        var n = t;
        t = r, r = n;
    } for (var i = t.length, o = r.length; i > 0 && t.charCodeAt(i - 1) === r.charCodeAt(o - 1);)
        i--, o--; for (var s = 0; s < i && t.charCodeAt(s) === r.charCodeAt(s);)
        s++; if (i -= s, o -= s, i === 0 || o < 3)
        return o; var a = 0, l, u, g, h, T, k, A, S, I, _, D, O, q = []; for (l = 0; l < i; l++)
        q.push(l + 1), q.push(t.charCodeAt(s + l)); for (var Y = q.length - 1; a < o - 3;)
        for (I = r.charCodeAt(s + (u = a)), _ = r.charCodeAt(s + (g = a + 1)), D = r.charCodeAt(s + (h = a + 2)), O = r.charCodeAt(s + (T = a + 3)), k = a += 4, l = 0; l < Y; l += 2)
            A = q[l], S = q[l + 1], u = e(A, u, g, I, S), g = e(u, g, h, _, S), h = e(g, h, T, D, S), k = e(h, T, k, O, S), q[l] = k, T = h, h = g, g = u, u = A; for (; a < o;)
        for (I = r.charCodeAt(s + (u = a)), k = ++a, l = 0; l < Y; l += 2)
            A = q[l], q[l] = k = e(A, u, k, I, q[l + 1]), u = A; return k; }; }();
});
var Ro = he(() => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
});
var ko = he(() => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
});
var Xo = Se(($v, Wc) => { Wc.exports = { name: "@prisma/engines-version", version: "6.13.0-35.361e86d0ea4987e9f53a565309b3eed797a6bcbd", main: "index.js", types: "index.d.ts", license: "Apache-2.0", author: "Tim Suchanek <suchanek@prisma.io>", prisma: { enginesVersion: "361e86d0ea4987e9f53a565309b3eed797a6bcbd" }, repository: { type: "git", url: "https://github.com/prisma/engines-wrapper.git", directory: "packages/engines-version" }, devDependencies: { "@types/node": "18.19.76", typescript: "4.9.5" }, files: ["index.js", "index.d.ts"], scripts: { build: "tsc -d" } }; });
var $r, es = he(() => {
    "use strict";
    f();
    c();
    p();
    d();
    m();
    $r = class {
        constructor() {
            this.events = {};
        }
        on(t, r) { return this.events[t] || (this.events[t] = []), this.events[t].push(r), this; }
        emit(t, ...r) { return this.events[t] ? (this.events[t].forEach(n => { n(...r); }), !0) : !1; }
    };
});
var cd = {};
Xe(cd, { DMMF: () => $t, Debug: () => H, Decimal: () => Ee, Extensions: () => ln, MetricsClient: () => Et, PrismaClientInitializationError: () => Q, PrismaClientKnownRequestError: () => se, PrismaClientRustPanicError: () => ce, PrismaClientUnknownRequestError: () => J, PrismaClientValidationError: () => te, Public: () => un, Sql: () => le, createParam: () => Go, defineDmmfProperty: () => Yo, deserializeJsonResponse: () => lt, deserializeRawResult: () => Yr, dmmfToRuntimeDataModel: () => wo, empty: () => rs, getPrismaClient: () => ya, getRuntime: () => Ms, join: () => ts, makeStrictEnum: () => wa, makeTypedQueryFactory: () => Zo, objectEnumValues: () => kr, raw: () => jn, serializeJsonQuery: () => Dr, skip: () => Lr, sqltag: () => Un, warnEnvConflicts: () => void 0, warnOnce: () => Dt });
module.exports = Ca(cd);
f();
c();
p();
d();
m();
var ln = {};
Xe(ln, { defineExtension: () => Ci, getExtensionContext: () => Ai });
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
function Ci(e) { return typeof e == "function" ? e : t => t.$extends(e); }
f();
c();
p();
d();
m();
function Ai(e) { return e; }
var un = {};
Xe(un, { validator: () => Si });
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
function Si(...e) { return t => t; }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var or = {};
Xe(or, { $: () => Fi, bgBlack: () => ll, bgBlue: () => dl, bgCyan: () => fl, bgGreen: () => cl, bgMagenta: () => ml, bgRed: () => ul, bgWhite: () => gl, bgYellow: () => pl, black: () => il, blue: () => We, bold: () => de, cyan: () => Oe, dim: () => St, gray: () => It, green: () => kt, grey: () => al, hidden: () => rl, inverse: () => tl, italic: () => el, magenta: () => ol, red: () => Je, reset: () => Xa, strikethrough: () => nl, underline: () => Rt, white: () => sl, yellow: () => Ot });
f();
c();
p();
d();
m();
var cn, Ri, ki, Oi, Ii = !0;
typeof y < "u" && ({ FORCE_COLOR: cn, NODE_DISABLE_COLORS: Ri, NO_COLOR: ki, TERM: Oi } = y.env || {}, Ii = y.stdout && y.stdout.isTTY);
var Fi = { enabled: !Ri && ki == null && Oi !== "dumb" && (cn != null && cn !== "0" || Ii) };
function V(e, t) { let r = new RegExp(`\\x1b\\[${t}m`, "g"), n = `\x1B[${e}m`, i = `\x1B[${t}m`; return function (o) { return !Fi.enabled || o == null ? o : n + (~("" + o).indexOf(i) ? o.replace(r, i + n) : o) + i; }; }
var Xa = V(0, 0), de = V(1, 22), St = V(2, 22), el = V(3, 23), Rt = V(4, 24), tl = V(7, 27), rl = V(8, 28), nl = V(9, 29), il = V(30, 39), Je = V(31, 39), kt = V(32, 39), Ot = V(33, 39), We = V(34, 39), ol = V(35, 39), Oe = V(36, 39), sl = V(37, 39), It = V(90, 39), al = V(90, 39), ll = V(40, 49), ul = V(41, 49), cl = V(42, 49), pl = V(43, 49), dl = V(44, 49), ml = V(45, 49), fl = V(46, 49), gl = V(47, 49);
f();
c();
p();
d();
m();
var hl = 100, Mi = ["green", "yellow", "blue", "magenta", "cyan", "red"], Ft = [], _i = Date.now(), yl = 0, pn = typeof y < "u" ? y.env : {};
globalThis.DEBUG ?? (globalThis.DEBUG = pn.DEBUG ?? "");
globalThis.DEBUG_COLORS ?? (globalThis.DEBUG_COLORS = pn.DEBUG_COLORS ? pn.DEBUG_COLORS === "true" : !0);
var Mt = { enable(e) { typeof e == "string" && (globalThis.DEBUG = e); }, disable() { let e = globalThis.DEBUG; return globalThis.DEBUG = "", e; }, enabled(e) { let t = globalThis.DEBUG.split(",").map(i => i.replace(/[.+?^${}()|[\]\\]/g, "\\$&")), r = t.some(i => i === "" || i[0] === "-" ? !1 : e.match(RegExp(i.split("*").join(".*") + "$"))), n = t.some(i => i === "" || i[0] !== "-" ? !1 : e.match(RegExp(i.slice(1).split("*").join(".*") + "$"))); return r && !n; }, log: (...e) => { let [t, r, ...n] = e; (console.warn ?? console.log)(`${t} ${r}`, ...n); }, formatters: {} };
function wl(e) { let t = { color: Mi[yl++ % Mi.length], enabled: Mt.enabled(e), namespace: e, log: Mt.log, extend: () => { } }, r = (...n) => { let { enabled: i, namespace: o, color: s, log: a } = t; if (n.length !== 0 && Ft.push([o, ...n]), Ft.length > hl && Ft.shift(), Mt.enabled(o) || i) {
    let l = n.map(g => typeof g == "string" ? g : bl(g)), u = `+${Date.now() - _i}ms`;
    _i = Date.now(), globalThis.DEBUG_COLORS ? a(or[s](de(o)), ...l, or[s](u)) : a(o, ...l, u);
} }; return new Proxy(r, { get: (n, i) => t[i], set: (n, i, o) => t[i] = o }); }
var H = new Proxy(wl, { get: (e, t) => Mt[t], set: (e, t, r) => Mt[t] = r });
function bl(e, t = 2) { let r = new Set; return JSON.stringify(e, (n, i) => { if (typeof i == "object" && i !== null) {
    if (r.has(i))
        return "[Circular *]";
    r.add(i);
}
else if (typeof i == "bigint")
    return i.toString(); return i; }, t); }
function Li(e = 7500) {
    let t = Ft.map(([r, ...n]) => `${r} ${n.map(i => typeof i == "string" ? i : JSON.stringify(i)).join(" ")}`).join(`
`);
    return t.length < e ? t : t.slice(-e);
}
function Di() { Ft.length = 0; }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var fn = ["darwin", "darwin-arm64", "debian-openssl-1.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x", "rhel-openssl-1.0.x", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x", "linux-arm64-openssl-1.1.x", "linux-arm64-openssl-1.0.x", "linux-arm64-openssl-3.0.x", "linux-arm-openssl-1.1.x", "linux-arm-openssl-1.0.x", "linux-arm-openssl-3.0.x", "linux-musl", "linux-musl-openssl-3.0.x", "linux-musl-arm64-openssl-1.1.x", "linux-musl-arm64-openssl-3.0.x", "linux-nixos", "linux-static-x64", "linux-static-arm64", "windows", "freebsd11", "freebsd12", "freebsd13", "freebsd14", "freebsd15", "openbsd", "netbsd", "arm"];
f();
c();
p();
d();
m();
var Jl = Bi(), hn = Jl.version;
f();
c();
p();
d();
m();
function it(e) { let t = Wl(); return t || (e?.config.engineType === "library" ? "library" : e?.config.engineType === "binary" ? "binary" : e?.config.engineType === "client" ? "client" : Kl(e)); }
function Wl() { let e = y.env.PRISMA_CLIENT_ENGINE_TYPE; return e === "library" ? "library" : e === "binary" ? "binary" : e === "client" ? "client" : void 0; }
function Kl(e) { return e?.previewFeatures.includes("queryCompiler") ? "client" : "library"; }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
function yn(e) { return e.name === "DriverAdapterError" && typeof e.cause == "object"; }
f();
c();
p();
d();
m();
function ar(e) { return { ok: !0, value: e, map(t) { return ar(t(e)); }, flatMap(t) { return t(e); } }; }
function Ke(e) { return { ok: !1, error: e, map() { return Ke(e); }, flatMap() { return Ke(e); } }; }
var ji = H("driver-adapter-utils"), wn = class {
    constructor() {
        this.registeredErrors = [];
    }
    consumeError(t) { return this.registeredErrors[t]; }
    registerNewError(t) { let r = 0; for (; this.registeredErrors[r] !== void 0;)
        r++; return this.registeredErrors[r] = { error: t }, r; }
};
var lr = (e, t = new wn) => { let r = { adapterName: e.adapterName, errorRegistry: t, queryRaw: Fe(t, e.queryRaw.bind(e)), executeRaw: Fe(t, e.executeRaw.bind(e)), executeScript: Fe(t, e.executeScript.bind(e)), dispose: Fe(t, e.dispose.bind(e)), provider: e.provider, startTransaction: async (...n) => (await Fe(t, e.startTransaction.bind(e))(...n)).map(o => Hl(t, o)) }; return e.getConnectionInfo && (r.getConnectionInfo = zl(t, e.getConnectionInfo.bind(e))), r; }, Hl = (e, t) => ({ adapterName: t.adapterName, provider: t.provider, options: t.options, queryRaw: Fe(e, t.queryRaw.bind(t)), executeRaw: Fe(e, t.executeRaw.bind(t)), commit: Fe(e, t.commit.bind(t)), rollback: Fe(e, t.rollback.bind(t)) });
function Fe(e, t) { return async (...r) => { try {
    return ar(await t(...r));
}
catch (n) {
    if (ji("[error@wrapAsync]", n), yn(n))
        return Ke(n.cause);
    let i = e.registerNewError(n);
    return Ke({ kind: "GenericJs", id: i });
} }; }
function zl(e, t) { return (...r) => { try {
    return ar(t(...r));
}
catch (n) {
    if (ji("[error@wrapSync]", n), yn(n))
        return Ke(n.cause);
    let i = e.registerNewError(n);
    return Ke({ kind: "GenericJs", id: i });
} }; }
f();
c();
p();
d();
m();
var Qi = Re(Vi(), 1);
function bn(e) { let t = (0, Qi.default)(e); if (t === 0)
    return e; let r = new RegExp(`^[ \\t]{${t}}`, "gm"); return e.replace(r, ""); }
f();
c();
p();
d();
m();
var Gi = "prisma+postgres", Ji = `${Gi}:`;
function En(e) { return e?.toString().startsWith(`${Ji}//`) ?? !1; }
var Lt = {};
Xe(Lt, { error: () => Xl, info: () => Zl, log: () => Yl, query: () => eu, should: () => Hi, tags: () => _t, warn: () => xn });
f();
c();
p();
d();
m();
var _t = { error: Je("prisma:error"), warn: Ot("prisma:warn"), info: Oe("prisma:info"), query: We("prisma:query") }, Hi = { warn: () => !y.env.PRISMA_DISABLE_WARNINGS };
function Yl(...e) { console.log(...e); }
function xn(e, ...t) { Hi.warn() && console.warn(`${_t.warn} ${e}`, ...t); }
function Zl(e, ...t) { console.info(`${_t.info} ${e}`, ...t); }
function Xl(e, ...t) { console.error(`${_t.error} ${e}`, ...t); }
function eu(e, ...t) { console.log(`${_t.query} ${e}`, ...t); }
f();
c();
p();
d();
m();
function ur(e, t) { if (!e)
    throw new Error(`${t}. This should never happen. If you see this error, please, open an issue at https://pris.ly/prisma-prisma-bug-report`); }
f();
c();
p();
d();
m();
function Me(e, t) { throw new Error(t); }
f();
c();
p();
d();
m();
gn();
function vn(e) { return Ie.sep === Ie.posix.sep ? e : e.split(Ie.sep).join(Ie.posix.sep); }
f();
c();
p();
d();
m();
function Tn(e, t) { return Object.prototype.hasOwnProperty.call(e, t); }
f();
c();
p();
d();
m();
function ot(e, t) { let r = {}; for (let n of Object.keys(e))
    r[n] = t(e[n], n); return r; }
f();
c();
p();
d();
m();
function Cn(e, t) { if (e.length === 0)
    return; let r = e[0]; for (let n = 1; n < e.length; n++)
    t(r, e[n]) < 0 && (r = e[n]); return r; }
f();
c();
p();
d();
m();
function ue(e, t) { Object.defineProperty(e, "name", { value: t, configurable: !0 }); }
f();
c();
p();
d();
m();
var eo = new Set, Dt = (e, t, ...r) => { eo.has(e) || (eo.add(e), xn(t, ...r)); };
var Q = class e extends Error {
    constructor(t, r, n) { super(t), this.name = "PrismaClientInitializationError", this.clientVersion = r, this.errorCode = n, Error.captureStackTrace(e); }
    get [Symbol.toStringTag]() { return "PrismaClientInitializationError"; }
};
ue(Q, "PrismaClientInitializationError");
f();
c();
p();
d();
m();
var se = class extends Error {
    constructor(t, { code: r, clientVersion: n, meta: i, batchRequestIdx: o }) { super(t), this.name = "PrismaClientKnownRequestError", this.code = r, this.clientVersion = n, this.meta = i, Object.defineProperty(this, "batchRequestIdx", { value: o, enumerable: !1, writable: !0 }); }
    get [Symbol.toStringTag]() { return "PrismaClientKnownRequestError"; }
};
ue(se, "PrismaClientKnownRequestError");
f();
c();
p();
d();
m();
var ce = class extends Error {
    constructor(t, r) { super(t), this.name = "PrismaClientRustPanicError", this.clientVersion = r; }
    get [Symbol.toStringTag]() { return "PrismaClientRustPanicError"; }
};
ue(ce, "PrismaClientRustPanicError");
f();
c();
p();
d();
m();
var J = class extends Error {
    constructor(t, { clientVersion: r, batchRequestIdx: n }) { super(t), this.name = "PrismaClientUnknownRequestError", this.clientVersion = r, Object.defineProperty(this, "batchRequestIdx", { value: n, writable: !0, enumerable: !1 }); }
    get [Symbol.toStringTag]() { return "PrismaClientUnknownRequestError"; }
};
ue(J, "PrismaClientUnknownRequestError");
f();
c();
p();
d();
m();
var te = class extends Error {
    constructor(t, { clientVersion: r }) {
        this.name = "PrismaClientValidationError";
        super(t), this.clientVersion = r;
    }
    get [Symbol.toStringTag]() { return "PrismaClientValidationError"; }
};
ue(te, "PrismaClientValidationError");
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var st = 9e15, Be = 1e9, An = "0123456789abcdef", mr = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058", fr = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789", Sn = { precision: 20, rounding: 4, modulo: 1, toExpNeg: -7, toExpPos: 21, minE: -st, maxE: st, crypto: !1 }, oo, _e, L = !0, hr = "[DecimalError] ", $e = hr + "Invalid argument: ", so = hr + "Precision limit exceeded", ao = hr + "crypto unavailable", lo = "[object Decimal]", re = Math.floor, W = Math.pow, ru = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i, nu = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i, iu = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i, uo = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, me = 1e7, M = 7, ou = 9007199254740991, su = mr.length - 1, Rn = fr.length - 1, R = { toStringTag: lo };
R.absoluteValue = R.abs = function () { var e = new this.constructor(this); return e.s < 0 && (e.s = 1), F(e); };
R.ceil = function () { return F(new this.constructor(this), this.e + 1, 2); };
R.clampedTo = R.clamp = function (e, t) { var r, n = this, i = n.constructor; if (e = new i(e), t = new i(t), !e.s || !t.s)
    return new i(NaN); if (e.gt(t))
    throw Error($e + t); return r = n.cmp(e), r < 0 ? e : n.cmp(t) > 0 ? t : new i(n); };
R.comparedTo = R.cmp = function (e) { var t, r, n, i, o = this, s = o.d, a = (e = new o.constructor(e)).d, l = o.s, u = e.s; if (!s || !a)
    return !l || !u ? NaN : l !== u ? l : s === a ? 0 : !s ^ l < 0 ? 1 : -1; if (!s[0] || !a[0])
    return s[0] ? l : a[0] ? -u : 0; if (l !== u)
    return l; if (o.e !== e.e)
    return o.e > e.e ^ l < 0 ? 1 : -1; for (n = s.length, i = a.length, t = 0, r = n < i ? n : i; t < r; ++t)
    if (s[t] !== a[t])
        return s[t] > a[t] ^ l < 0 ? 1 : -1; return n === i ? 0 : n > i ^ l < 0 ? 1 : -1; };
R.cosine = R.cos = function () { var e, t, r = this, n = r.constructor; return r.d ? r.d[0] ? (e = n.precision, t = n.rounding, n.precision = e + Math.max(r.e, r.sd()) + M, n.rounding = 1, r = au(n, go(n, r)), n.precision = e, n.rounding = t, F(_e == 2 || _e == 3 ? r.neg() : r, e, t, !0)) : new n(1) : new n(NaN); };
R.cubeRoot = R.cbrt = function () { var e, t, r, n, i, o, s, a, l, u, g = this, h = g.constructor; if (!g.isFinite() || g.isZero())
    return new h(g); for (L = !1, o = g.s * W(g.s * g, 1 / 3), !o || Math.abs(o) == 1 / 0 ? (r = Z(g.d), e = g.e, (o = (e - r.length + 1) % 3) && (r += o == 1 || o == -2 ? "0" : "00"), o = W(r, 1 / 3), e = re((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2)), o == 1 / 0 ? r = "5e" + e : (r = o.toExponential(), r = r.slice(0, r.indexOf("e") + 1) + e), n = new h(r), n.s = g.s) : n = new h(o.toString()), s = (e = h.precision) + 3;;)
    if (a = n, l = a.times(a).times(a), u = l.plus(g), n = j(u.plus(g).times(a), u.plus(l), s + 2, 1), Z(a.d).slice(0, s) === (r = Z(n.d)).slice(0, s))
        if (r = r.slice(s - 3, s + 1), r == "9999" || !i && r == "4999") {
            if (!i && (F(a, e + 1, 0), a.times(a).times(a).eq(g))) {
                n = a;
                break;
            }
            s += 4, i = 1;
        }
        else {
            (!+r || !+r.slice(1) && r.charAt(0) == "5") && (F(n, e + 1, 1), t = !n.times(n).times(n).eq(g));
            break;
        } return L = !0, F(n, e, h.rounding, t); };
R.decimalPlaces = R.dp = function () { var e, t = this.d, r = NaN; if (t) {
    if (e = t.length - 1, r = (e - re(this.e / M)) * M, e = t[e], e)
        for (; e % 10 == 0; e /= 10)
            r--;
    r < 0 && (r = 0);
} return r; };
R.dividedBy = R.div = function (e) { return j(this, new this.constructor(e)); };
R.dividedToIntegerBy = R.divToInt = function (e) { var t = this, r = t.constructor; return F(j(t, new r(e), 0, 1, 1), r.precision, r.rounding); };
R.equals = R.eq = function (e) { return this.cmp(e) === 0; };
R.floor = function () { return F(new this.constructor(this), this.e + 1, 3); };
R.greaterThan = R.gt = function (e) { return this.cmp(e) > 0; };
R.greaterThanOrEqualTo = R.gte = function (e) { var t = this.cmp(e); return t == 1 || t === 0; };
R.hyperbolicCosine = R.cosh = function () { var e, t, r, n, i, o = this, s = o.constructor, a = new s(1); if (!o.isFinite())
    return new s(o.s ? 1 / 0 : NaN); if (o.isZero())
    return a; r = s.precision, n = s.rounding, s.precision = r + Math.max(o.e, o.sd()) + 4, s.rounding = 1, i = o.d.length, i < 32 ? (e = Math.ceil(i / 3), t = (1 / wr(4, e)).toString()) : (e = 16, t = "2.3283064365386962890625e-10"), o = at(s, 1, o.times(t), new s(1), !0); for (var l, u = e, g = new s(8); u--;)
    l = o.times(o), o = a.minus(l.times(g.minus(l.times(g)))); return F(o, s.precision = r, s.rounding = n, !0); };
R.hyperbolicSine = R.sinh = function () { var e, t, r, n, i = this, o = i.constructor; if (!i.isFinite() || i.isZero())
    return new o(i); if (t = o.precision, r = o.rounding, o.precision = t + Math.max(i.e, i.sd()) + 4, o.rounding = 1, n = i.d.length, n < 3)
    i = at(o, 2, i, i, !0);
else {
    e = 1.4 * Math.sqrt(n), e = e > 16 ? 16 : e | 0, i = i.times(1 / wr(5, e)), i = at(o, 2, i, i, !0);
    for (var s, a = new o(5), l = new o(16), u = new o(20); e--;)
        s = i.times(i), i = i.times(a.plus(s.times(l.times(s).plus(u))));
} return o.precision = t, o.rounding = r, F(i, t, r, !0); };
R.hyperbolicTangent = R.tanh = function () { var e, t, r = this, n = r.constructor; return r.isFinite() ? r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + 7, n.rounding = 1, j(r.sinh(), r.cosh(), n.precision = e, n.rounding = t)) : new n(r.s); };
R.inverseCosine = R.acos = function () { var e = this, t = e.constructor, r = e.abs().cmp(1), n = t.precision, i = t.rounding; return r !== -1 ? r === 0 ? e.isNeg() ? we(t, n, i) : new t(0) : new t(NaN) : e.isZero() ? we(t, n + 4, i).times(.5) : (t.precision = n + 6, t.rounding = 1, e = new t(1).minus(e).div(e.plus(1)).sqrt().atan(), t.precision = n, t.rounding = i, e.times(2)); };
R.inverseHyperbolicCosine = R.acosh = function () { var e, t, r = this, n = r.constructor; return r.lte(1) ? new n(r.eq(1) ? 0 : NaN) : r.isFinite() ? (e = n.precision, t = n.rounding, n.precision = e + Math.max(Math.abs(r.e), r.sd()) + 4, n.rounding = 1, L = !1, r = r.times(r).minus(1).sqrt().plus(r), L = !0, n.precision = e, n.rounding = t, r.ln()) : new n(r); };
R.inverseHyperbolicSine = R.asinh = function () { var e, t, r = this, n = r.constructor; return !r.isFinite() || r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + 2 * Math.max(Math.abs(r.e), r.sd()) + 6, n.rounding = 1, L = !1, r = r.times(r).plus(1).sqrt().plus(r), L = !0, n.precision = e, n.rounding = t, r.ln()); };
R.inverseHyperbolicTangent = R.atanh = function () { var e, t, r, n, i = this, o = i.constructor; return i.isFinite() ? i.e >= 0 ? new o(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN) : (e = o.precision, t = o.rounding, n = i.sd(), Math.max(n, e) < 2 * -i.e - 1 ? F(new o(i), e, t, !0) : (o.precision = r = n - i.e, i = j(i.plus(1), new o(1).minus(i), r + e, 1), o.precision = e + 4, o.rounding = 1, i = i.ln(), o.precision = e, o.rounding = t, i.times(.5))) : new o(NaN); };
R.inverseSine = R.asin = function () { var e, t, r, n, i = this, o = i.constructor; return i.isZero() ? new o(i) : (t = i.abs().cmp(1), r = o.precision, n = o.rounding, t !== -1 ? t === 0 ? (e = we(o, r + 4, n).times(.5), e.s = i.s, e) : new o(NaN) : (o.precision = r + 6, o.rounding = 1, i = i.div(new o(1).minus(i.times(i)).sqrt().plus(1)).atan(), o.precision = r, o.rounding = n, i.times(2))); };
R.inverseTangent = R.atan = function () { var e, t, r, n, i, o, s, a, l, u = this, g = u.constructor, h = g.precision, T = g.rounding; if (u.isFinite()) {
    if (u.isZero())
        return new g(u);
    if (u.abs().eq(1) && h + 4 <= Rn)
        return s = we(g, h + 4, T).times(.25), s.s = u.s, s;
}
else {
    if (!u.s)
        return new g(NaN);
    if (h + 4 <= Rn)
        return s = we(g, h + 4, T).times(.5), s.s = u.s, s;
} for (g.precision = a = h + 10, g.rounding = 1, r = Math.min(28, a / M + 2 | 0), e = r; e; --e)
    u = u.div(u.times(u).plus(1).sqrt().plus(1)); for (L = !1, t = Math.ceil(a / M), n = 1, l = u.times(u), s = new g(u), i = u; e !== -1;)
    if (i = i.times(l), o = s.minus(i.div(n += 2)), i = i.times(l), s = o.plus(i.div(n += 2)), s.d[t] !== void 0)
        for (e = t; s.d[e] === o.d[e] && e--;)
            ; return r && (s = s.times(2 << r - 1)), L = !0, F(s, g.precision = h, g.rounding = T, !0); };
R.isFinite = function () { return !!this.d; };
R.isInteger = R.isInt = function () { return !!this.d && re(this.e / M) > this.d.length - 2; };
R.isNaN = function () { return !this.s; };
R.isNegative = R.isNeg = function () { return this.s < 0; };
R.isPositive = R.isPos = function () { return this.s > 0; };
R.isZero = function () { return !!this.d && this.d[0] === 0; };
R.lessThan = R.lt = function (e) { return this.cmp(e) < 0; };
R.lessThanOrEqualTo = R.lte = function (e) { return this.cmp(e) < 1; };
R.logarithm = R.log = function (e) { var t, r, n, i, o, s, a, l, u = this, g = u.constructor, h = g.precision, T = g.rounding, k = 5; if (e == null)
    e = new g(10), t = !0;
else {
    if (e = new g(e), r = e.d, e.s < 0 || !r || !r[0] || e.eq(1))
        return new g(NaN);
    t = e.eq(10);
} if (r = u.d, u.s < 0 || !r || !r[0] || u.eq(1))
    return new g(r && !r[0] ? -1 / 0 : u.s != 1 ? NaN : r ? 0 : 1 / 0); if (t)
    if (r.length > 1)
        o = !0;
    else {
        for (i = r[0]; i % 10 === 0;)
            i /= 10;
        o = i !== 1;
    } if (L = !1, a = h + k, s = qe(u, a), n = t ? gr(g, a + 10) : qe(e, a), l = j(s, n, a, 1), Nt(l.d, i = h, T))
    do
        if (a += 10, s = qe(u, a), n = t ? gr(g, a + 10) : qe(e, a), l = j(s, n, a, 1), !o) {
            +Z(l.d).slice(i + 1, i + 15) + 1 == 1e14 && (l = F(l, h + 1, 0));
            break;
        }
    while (Nt(l.d, i += 10, T)); return L = !0, F(l, h, T); };
R.minus = R.sub = function (e) { var t, r, n, i, o, s, a, l, u, g, h, T, k = this, A = k.constructor; if (e = new A(e), !k.d || !e.d)
    return !k.s || !e.s ? e = new A(NaN) : k.d ? e.s = -e.s : e = new A(e.d || k.s !== e.s ? k : NaN), e; if (k.s != e.s)
    return e.s = -e.s, k.plus(e); if (u = k.d, T = e.d, a = A.precision, l = A.rounding, !u[0] || !T[0]) {
    if (T[0])
        e.s = -e.s;
    else if (u[0])
        e = new A(k);
    else
        return new A(l === 3 ? -0 : 0);
    return L ? F(e, a, l) : e;
} if (r = re(e.e / M), g = re(k.e / M), u = u.slice(), o = g - r, o) {
    for (h = o < 0, h ? (t = u, o = -o, s = T.length) : (t = T, r = g, s = u.length), n = Math.max(Math.ceil(a / M), s) + 2, o > n && (o = n, t.length = 1), t.reverse(), n = o; n--;)
        t.push(0);
    t.reverse();
}
else {
    for (n = u.length, s = T.length, h = n < s, h && (s = n), n = 0; n < s; n++)
        if (u[n] != T[n]) {
            h = u[n] < T[n];
            break;
        }
    o = 0;
} for (h && (t = u, u = T, T = t, e.s = -e.s), s = u.length, n = T.length - s; n > 0; --n)
    u[s++] = 0; for (n = T.length; n > o;) {
    if (u[--n] < T[n]) {
        for (i = n; i && u[--i] === 0;)
            u[i] = me - 1;
        --u[i], u[n] += me;
    }
    u[n] -= T[n];
} for (; u[--s] === 0;)
    u.pop(); for (; u[0] === 0; u.shift())
    --r; return u[0] ? (e.d = u, e.e = yr(u, r), L ? F(e, a, l) : e) : new A(l === 3 ? -0 : 0); };
R.modulo = R.mod = function (e) { var t, r = this, n = r.constructor; return e = new n(e), !r.d || !e.s || e.d && !e.d[0] ? new n(NaN) : !e.d || r.d && !r.d[0] ? F(new n(r), n.precision, n.rounding) : (L = !1, n.modulo == 9 ? (t = j(r, e.abs(), 0, 3, 1), t.s *= e.s) : t = j(r, e, 0, n.modulo, 1), t = t.times(e), L = !0, r.minus(t)); };
R.naturalExponential = R.exp = function () { return kn(this); };
R.naturalLogarithm = R.ln = function () { return qe(this); };
R.negated = R.neg = function () { var e = new this.constructor(this); return e.s = -e.s, F(e); };
R.plus = R.add = function (e) { var t, r, n, i, o, s, a, l, u, g, h = this, T = h.constructor; if (e = new T(e), !h.d || !e.d)
    return !h.s || !e.s ? e = new T(NaN) : h.d || (e = new T(e.d || h.s === e.s ? h : NaN)), e; if (h.s != e.s)
    return e.s = -e.s, h.minus(e); if (u = h.d, g = e.d, a = T.precision, l = T.rounding, !u[0] || !g[0])
    return g[0] || (e = new T(h)), L ? F(e, a, l) : e; if (o = re(h.e / M), n = re(e.e / M), u = u.slice(), i = o - n, i) {
    for (i < 0 ? (r = u, i = -i, s = g.length) : (r = g, n = o, s = u.length), o = Math.ceil(a / M), s = o > s ? o + 1 : s + 1, i > s && (i = s, r.length = 1), r.reverse(); i--;)
        r.push(0);
    r.reverse();
} for (s = u.length, i = g.length, s - i < 0 && (i = s, r = g, g = u, u = r), t = 0; i;)
    t = (u[--i] = u[i] + g[i] + t) / me | 0, u[i] %= me; for (t && (u.unshift(t), ++n), s = u.length; u[--s] == 0;)
    u.pop(); return e.d = u, e.e = yr(u, n), L ? F(e, a, l) : e; };
R.precision = R.sd = function (e) { var t, r = this; if (e !== void 0 && e !== !!e && e !== 1 && e !== 0)
    throw Error($e + e); return r.d ? (t = co(r.d), e && r.e + 1 > t && (t = r.e + 1)) : t = NaN, t; };
R.round = function () { var e = this, t = e.constructor; return F(new t(e), e.e + 1, t.rounding); };
R.sine = R.sin = function () { var e, t, r = this, n = r.constructor; return r.isFinite() ? r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + Math.max(r.e, r.sd()) + M, n.rounding = 1, r = uu(n, go(n, r)), n.precision = e, n.rounding = t, F(_e > 2 ? r.neg() : r, e, t, !0)) : new n(NaN); };
R.squareRoot = R.sqrt = function () { var e, t, r, n, i, o, s = this, a = s.d, l = s.e, u = s.s, g = s.constructor; if (u !== 1 || !a || !a[0])
    return new g(!u || u < 0 && (!a || a[0]) ? NaN : a ? s : 1 / 0); for (L = !1, u = Math.sqrt(+s), u == 0 || u == 1 / 0 ? (t = Z(a), (t.length + l) % 2 == 0 && (t += "0"), u = Math.sqrt(t), l = re((l + 1) / 2) - (l < 0 || l % 2), u == 1 / 0 ? t = "5e" + l : (t = u.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + l), n = new g(t)) : n = new g(u.toString()), r = (l = g.precision) + 3;;)
    if (o = n, n = o.plus(j(s, o, r + 2, 1)).times(.5), Z(o.d).slice(0, r) === (t = Z(n.d)).slice(0, r))
        if (t = t.slice(r - 3, r + 1), t == "9999" || !i && t == "4999") {
            if (!i && (F(o, l + 1, 0), o.times(o).eq(s))) {
                n = o;
                break;
            }
            r += 4, i = 1;
        }
        else {
            (!+t || !+t.slice(1) && t.charAt(0) == "5") && (F(n, l + 1, 1), e = !n.times(n).eq(s));
            break;
        } return L = !0, F(n, l, g.rounding, e); };
R.tangent = R.tan = function () { var e, t, r = this, n = r.constructor; return r.isFinite() ? r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + 10, n.rounding = 1, r = r.sin(), r.s = 1, r = j(r, new n(1).minus(r.times(r)).sqrt(), e + 10, 0), n.precision = e, n.rounding = t, F(_e == 2 || _e == 4 ? r.neg() : r, e, t, !0)) : new n(NaN); };
R.times = R.mul = function (e) { var t, r, n, i, o, s, a, l, u, g = this, h = g.constructor, T = g.d, k = (e = new h(e)).d; if (e.s *= g.s, !T || !T[0] || !k || !k[0])
    return new h(!e.s || T && !T[0] && !k || k && !k[0] && !T ? NaN : !T || !k ? e.s / 0 : e.s * 0); for (r = re(g.e / M) + re(e.e / M), l = T.length, u = k.length, l < u && (o = T, T = k, k = o, s = l, l = u, u = s), o = [], s = l + u, n = s; n--;)
    o.push(0); for (n = u; --n >= 0;) {
    for (t = 0, i = l + n; i > n;)
        a = o[i] + k[n] * T[i - n - 1] + t, o[i--] = a % me | 0, t = a / me | 0;
    o[i] = (o[i] + t) % me | 0;
} for (; !o[--s];)
    o.pop(); return t ? ++r : o.shift(), e.d = o, e.e = yr(o, r), L ? F(e, h.precision, h.rounding) : e; };
R.toBinary = function (e, t) { return On(this, 2, e, t); };
R.toDecimalPlaces = R.toDP = function (e, t) { var r = this, n = r.constructor; return r = new n(r), e === void 0 ? r : (ae(e, 0, Be), t === void 0 ? t = n.rounding : ae(t, 0, 8), F(r, e + r.e + 1, t)); };
R.toExponential = function (e, t) { var r, n = this, i = n.constructor; return e === void 0 ? r = be(n, !0) : (ae(e, 0, Be), t === void 0 ? t = i.rounding : ae(t, 0, 8), n = F(new i(n), e + 1, t), r = be(n, !0, e + 1)), n.isNeg() && !n.isZero() ? "-" + r : r; };
R.toFixed = function (e, t) { var r, n, i = this, o = i.constructor; return e === void 0 ? r = be(i) : (ae(e, 0, Be), t === void 0 ? t = o.rounding : ae(t, 0, 8), n = F(new o(i), e + i.e + 1, t), r = be(n, !1, e + n.e + 1)), i.isNeg() && !i.isZero() ? "-" + r : r; };
R.toFraction = function (e) { var t, r, n, i, o, s, a, l, u, g, h, T, k = this, A = k.d, S = k.constructor; if (!A)
    return new S(k); if (u = r = new S(1), n = l = new S(0), t = new S(n), o = t.e = co(A) - k.e - 1, s = o % M, t.d[0] = W(10, s < 0 ? M + s : s), e == null)
    e = o > 0 ? t : u;
else {
    if (a = new S(e), !a.isInt() || a.lt(u))
        throw Error($e + a);
    e = a.gt(t) ? o > 0 ? t : u : a;
} for (L = !1, a = new S(Z(A)), g = S.precision, S.precision = o = A.length * M * 2; h = j(a, t, 0, 1, 1), i = r.plus(h.times(n)), i.cmp(e) != 1;)
    r = n, n = i, i = u, u = l.plus(h.times(i)), l = i, i = t, t = a.minus(h.times(i)), a = i; return i = j(e.minus(r), n, 0, 1, 1), l = l.plus(i.times(u)), r = r.plus(i.times(n)), l.s = u.s = k.s, T = j(u, n, o, 1).minus(k).abs().cmp(j(l, r, o, 1).minus(k).abs()) < 1 ? [u, n] : [l, r], S.precision = g, L = !0, T; };
R.toHexadecimal = R.toHex = function (e, t) { return On(this, 16, e, t); };
R.toNearest = function (e, t) { var r = this, n = r.constructor; if (r = new n(r), e == null) {
    if (!r.d)
        return r;
    e = new n(1), t = n.rounding;
}
else {
    if (e = new n(e), t === void 0 ? t = n.rounding : ae(t, 0, 8), !r.d)
        return e.s ? r : e;
    if (!e.d)
        return e.s && (e.s = r.s), e;
} return e.d[0] ? (L = !1, r = j(r, e, 0, t, 1).times(e), L = !0, F(r)) : (e.s = r.s, r = e), r; };
R.toNumber = function () { return +this; };
R.toOctal = function (e, t) { return On(this, 8, e, t); };
R.toPower = R.pow = function (e) { var t, r, n, i, o, s, a = this, l = a.constructor, u = +(e = new l(e)); if (!a.d || !e.d || !a.d[0] || !e.d[0])
    return new l(W(+a, u)); if (a = new l(a), a.eq(1))
    return a; if (n = l.precision, o = l.rounding, e.eq(1))
    return F(a, n, o); if (t = re(e.e / M), t >= e.d.length - 1 && (r = u < 0 ? -u : u) <= ou)
    return i = po(l, a, r, n), e.s < 0 ? new l(1).div(i) : F(i, n, o); if (s = a.s, s < 0) {
    if (t < e.d.length - 1)
        return new l(NaN);
    if ((e.d[t] & 1) == 0 && (s = 1), a.e == 0 && a.d[0] == 1 && a.d.length == 1)
        return a.s = s, a;
} return r = W(+a, u), t = r == 0 || !isFinite(r) ? re(u * (Math.log("0." + Z(a.d)) / Math.LN10 + a.e + 1)) : new l(r + "").e, t > l.maxE + 1 || t < l.minE - 1 ? new l(t > 0 ? s / 0 : 0) : (L = !1, l.rounding = a.s = 1, r = Math.min(12, (t + "").length), i = kn(e.times(qe(a, n + r)), n), i.d && (i = F(i, n + 5, 1), Nt(i.d, n, o) && (t = n + 10, i = F(kn(e.times(qe(a, t + r)), t), t + 5, 1), +Z(i.d).slice(n + 1, n + 15) + 1 == 1e14 && (i = F(i, n + 1, 0)))), i.s = s, L = !0, l.rounding = o, F(i, n, o)); };
R.toPrecision = function (e, t) { var r, n = this, i = n.constructor; return e === void 0 ? r = be(n, n.e <= i.toExpNeg || n.e >= i.toExpPos) : (ae(e, 1, Be), t === void 0 ? t = i.rounding : ae(t, 0, 8), n = F(new i(n), e, t), r = be(n, e <= n.e || n.e <= i.toExpNeg, e)), n.isNeg() && !n.isZero() ? "-" + r : r; };
R.toSignificantDigits = R.toSD = function (e, t) { var r = this, n = r.constructor; return e === void 0 ? (e = n.precision, t = n.rounding) : (ae(e, 1, Be), t === void 0 ? t = n.rounding : ae(t, 0, 8)), F(new n(r), e, t); };
R.toString = function () { var e = this, t = e.constructor, r = be(e, e.e <= t.toExpNeg || e.e >= t.toExpPos); return e.isNeg() && !e.isZero() ? "-" + r : r; };
R.truncated = R.trunc = function () { return F(new this.constructor(this), this.e + 1, 1); };
R.valueOf = R.toJSON = function () { var e = this, t = e.constructor, r = be(e, e.e <= t.toExpNeg || e.e >= t.toExpPos); return e.isNeg() ? "-" + r : r; };
function Z(e) { var t, r, n, i = e.length - 1, o = "", s = e[0]; if (i > 0) {
    for (o += s, t = 1; t < i; t++)
        n = e[t] + "", r = M - n.length, r && (o += Ne(r)), o += n;
    s = e[t], n = s + "", r = M - n.length, r && (o += Ne(r));
}
else if (s === 0)
    return "0"; for (; s % 10 === 0;)
    s /= 10; return o + s; }
function ae(e, t, r) { if (e !== ~~e || e < t || e > r)
    throw Error($e + e); }
function Nt(e, t, r, n) { var i, o, s, a; for (o = e[0]; o >= 10; o /= 10)
    --t; return --t < 0 ? (t += M, i = 0) : (i = Math.ceil((t + 1) / M), t %= M), o = W(10, M - t), a = e[i] % o | 0, n == null ? t < 3 ? (t == 0 ? a = a / 100 | 0 : t == 1 && (a = a / 10 | 0), s = r < 4 && a == 99999 || r > 3 && a == 49999 || a == 5e4 || a == 0) : s = (r < 4 && a + 1 == o || r > 3 && a + 1 == o / 2) && (e[i + 1] / o / 100 | 0) == W(10, t - 2) - 1 || (a == o / 2 || a == 0) && (e[i + 1] / o / 100 | 0) == 0 : t < 4 ? (t == 0 ? a = a / 1e3 | 0 : t == 1 ? a = a / 100 | 0 : t == 2 && (a = a / 10 | 0), s = (n || r < 4) && a == 9999 || !n && r > 3 && a == 4999) : s = ((n || r < 4) && a + 1 == o || !n && r > 3 && a + 1 == o / 2) && (e[i + 1] / o / 1e3 | 0) == W(10, t - 3) - 1, s; }
function pr(e, t, r) { for (var n, i = [0], o, s = 0, a = e.length; s < a;) {
    for (o = i.length; o--;)
        i[o] *= t;
    for (i[0] += An.indexOf(e.charAt(s++)), n = 0; n < i.length; n++)
        i[n] > r - 1 && (i[n + 1] === void 0 && (i[n + 1] = 0), i[n + 1] += i[n] / r | 0, i[n] %= r);
} return i.reverse(); }
function au(e, t) { var r, n, i; if (t.isZero())
    return t; n = t.d.length, n < 32 ? (r = Math.ceil(n / 3), i = (1 / wr(4, r)).toString()) : (r = 16, i = "2.3283064365386962890625e-10"), e.precision += r, t = at(e, 1, t.times(i), new e(1)); for (var o = r; o--;) {
    var s = t.times(t);
    t = s.times(s).minus(s).times(8).plus(1);
} return e.precision -= r, t; }
var j = function () { function e(n, i, o) { var s, a = 0, l = n.length; for (n = n.slice(); l--;)
    s = n[l] * i + a, n[l] = s % o | 0, a = s / o | 0; return a && n.unshift(a), n; } function t(n, i, o, s) { var a, l; if (o != s)
    l = o > s ? 1 : -1;
else
    for (a = l = 0; a < o; a++)
        if (n[a] != i[a]) {
            l = n[a] > i[a] ? 1 : -1;
            break;
        } return l; } function r(n, i, o, s) { for (var a = 0; o--;)
    n[o] -= a, a = n[o] < i[o] ? 1 : 0, n[o] = a * s + n[o] - i[o]; for (; !n[0] && n.length > 1;)
    n.shift(); } return function (n, i, o, s, a, l) { var u, g, h, T, k, A, S, I, _, D, O, q, Y, U, Ct, G, ie, Ae, X, Ze, tr = n.constructor, Xr = n.s == i.s ? 1 : -1, ee = n.d, B = i.d; if (!ee || !ee[0] || !B || !B[0])
    return new tr(!n.s || !i.s || (ee ? B && ee[0] == B[0] : !B) ? NaN : ee && ee[0] == 0 || !B ? Xr * 0 : Xr / 0); for (l ? (k = 1, g = n.e - i.e) : (l = me, k = M, g = re(n.e / k) - re(i.e / k)), X = B.length, ie = ee.length, _ = new tr(Xr), D = _.d = [], h = 0; B[h] == (ee[h] || 0); h++)
    ; if (B[h] > (ee[h] || 0) && g--, o == null ? (U = o = tr.precision, s = tr.rounding) : a ? U = o + (n.e - i.e) + 1 : U = o, U < 0)
    D.push(1), A = !0;
else {
    if (U = U / k + 2 | 0, h = 0, X == 1) {
        for (T = 0, B = B[0], U++; (h < ie || T) && U--; h++)
            Ct = T * l + (ee[h] || 0), D[h] = Ct / B | 0, T = Ct % B | 0;
        A = T || h < ie;
    }
    else {
        for (T = l / (B[0] + 1) | 0, T > 1 && (B = e(B, T, l), ee = e(ee, T, l), X = B.length, ie = ee.length), G = X, O = ee.slice(0, X), q = O.length; q < X;)
            O[q++] = 0;
        Ze = B.slice(), Ze.unshift(0), Ae = B[0], B[1] >= l / 2 && ++Ae;
        do
            T = 0, u = t(B, O, X, q), u < 0 ? (Y = O[0], X != q && (Y = Y * l + (O[1] || 0)), T = Y / Ae | 0, T > 1 ? (T >= l && (T = l - 1), S = e(B, T, l), I = S.length, q = O.length, u = t(S, O, I, q), u == 1 && (T--, r(S, X < I ? Ze : B, I, l))) : (T == 0 && (u = T = 1), S = B.slice()), I = S.length, I < q && S.unshift(0), r(O, S, q, l), u == -1 && (q = O.length, u = t(B, O, X, q), u < 1 && (T++, r(O, X < q ? Ze : B, q, l))), q = O.length) : u === 0 && (T++, O = [0]), D[h++] = T, u && O[0] ? O[q++] = ee[G] || 0 : (O = [ee[G]], q = 1);
        while ((G++ < ie || O[0] !== void 0) && U--);
        A = O[0] !== void 0;
    }
    D[0] || D.shift();
} if (k == 1)
    _.e = g, oo = A;
else {
    for (h = 1, T = D[0]; T >= 10; T /= 10)
        h++;
    _.e = h + g * k - 1, F(_, a ? o + _.e + 1 : o, s, A);
} return _; }; }();
function F(e, t, r, n) { var i, o, s, a, l, u, g, h, T, k = e.constructor; e: if (t != null) {
    if (h = e.d, !h)
        return e;
    for (i = 1, a = h[0]; a >= 10; a /= 10)
        i++;
    if (o = t - i, o < 0)
        o += M, s = t, g = h[T = 0], l = g / W(10, i - s - 1) % 10 | 0;
    else if (T = Math.ceil((o + 1) / M), a = h.length, T >= a)
        if (n) {
            for (; a++ <= T;)
                h.push(0);
            g = l = 0, i = 1, o %= M, s = o - M + 1;
        }
        else
            break e;
    else {
        for (g = a = h[T], i = 1; a >= 10; a /= 10)
            i++;
        o %= M, s = o - M + i, l = s < 0 ? 0 : g / W(10, i - s - 1) % 10 | 0;
    }
    if (n = n || t < 0 || h[T + 1] !== void 0 || (s < 0 ? g : g % W(10, i - s - 1)), u = r < 4 ? (l || n) && (r == 0 || r == (e.s < 0 ? 3 : 2)) : l > 5 || l == 5 && (r == 4 || n || r == 6 && (o > 0 ? s > 0 ? g / W(10, i - s) : 0 : h[T - 1]) % 10 & 1 || r == (e.s < 0 ? 8 : 7)), t < 1 || !h[0])
        return h.length = 0, u ? (t -= e.e + 1, h[0] = W(10, (M - t % M) % M), e.e = -t || 0) : h[0] = e.e = 0, e;
    if (o == 0 ? (h.length = T, a = 1, T--) : (h.length = T + 1, a = W(10, M - o), h[T] = s > 0 ? (g / W(10, i - s) % W(10, s) | 0) * a : 0), u)
        for (;;)
            if (T == 0) {
                for (o = 1, s = h[0]; s >= 10; s /= 10)
                    o++;
                for (s = h[0] += a, a = 1; s >= 10; s /= 10)
                    a++;
                o != a && (e.e++, h[0] == me && (h[0] = 1));
                break;
            }
            else {
                if (h[T] += a, h[T] != me)
                    break;
                h[T--] = 0, a = 1;
            }
    for (o = h.length; h[--o] === 0;)
        h.pop();
} return L && (e.e > k.maxE ? (e.d = null, e.e = NaN) : e.e < k.minE && (e.e = 0, e.d = [0])), e; }
function be(e, t, r) { if (!e.isFinite())
    return fo(e); var n, i = e.e, o = Z(e.d), s = o.length; return t ? (r && (n = r - s) > 0 ? o = o.charAt(0) + "." + o.slice(1) + Ne(n) : s > 1 && (o = o.charAt(0) + "." + o.slice(1)), o = o + (e.e < 0 ? "e" : "e+") + e.e) : i < 0 ? (o = "0." + Ne(-i - 1) + o, r && (n = r - s) > 0 && (o += Ne(n))) : i >= s ? (o += Ne(i + 1 - s), r && (n = r - i - 1) > 0 && (o = o + "." + Ne(n))) : ((n = i + 1) < s && (o = o.slice(0, n) + "." + o.slice(n)), r && (n = r - s) > 0 && (i + 1 === s && (o += "."), o += Ne(n))), o; }
function yr(e, t) { var r = e[0]; for (t *= M; r >= 10; r /= 10)
    t++; return t; }
function gr(e, t, r) { if (t > su)
    throw L = !0, r && (e.precision = r), Error(so); return F(new e(mr), t, 1, !0); }
function we(e, t, r) { if (t > Rn)
    throw Error(so); return F(new e(fr), t, r, !0); }
function co(e) { var t = e.length - 1, r = t * M + 1; if (t = e[t], t) {
    for (; t % 10 == 0; t /= 10)
        r--;
    for (t = e[0]; t >= 10; t /= 10)
        r++;
} return r; }
function Ne(e) { for (var t = ""; e--;)
    t += "0"; return t; }
function po(e, t, r, n) { var i, o = new e(1), s = Math.ceil(n / M + 4); for (L = !1;;) {
    if (r % 2 && (o = o.times(t), no(o.d, s) && (i = !0)), r = re(r / 2), r === 0) {
        r = o.d.length - 1, i && o.d[r] === 0 && ++o.d[r];
        break;
    }
    t = t.times(t), no(t.d, s);
} return L = !0, o; }
function ro(e) { return e.d[e.d.length - 1] & 1; }
function mo(e, t, r) { for (var n, i, o = new e(t[0]), s = 0; ++s < t.length;) {
    if (i = new e(t[s]), !i.s) {
        o = i;
        break;
    }
    n = o.cmp(i), (n === r || n === 0 && o.s === r) && (o = i);
} return o; }
function kn(e, t) { var r, n, i, o, s, a, l, u = 0, g = 0, h = 0, T = e.constructor, k = T.rounding, A = T.precision; if (!e.d || !e.d[0] || e.e > 17)
    return new T(e.d ? e.d[0] ? e.s < 0 ? 0 : 1 / 0 : 1 : e.s ? e.s < 0 ? 0 : e : NaN); for (t == null ? (L = !1, l = A) : l = t, a = new T(.03125); e.e > -2;)
    e = e.times(a), h += 5; for (n = Math.log(W(2, h)) / Math.LN10 * 2 + 5 | 0, l += n, r = o = s = new T(1), T.precision = l;;) {
    if (o = F(o.times(e), l, 1), r = r.times(++g), a = s.plus(j(o, r, l, 1)), Z(a.d).slice(0, l) === Z(s.d).slice(0, l)) {
        for (i = h; i--;)
            s = F(s.times(s), l, 1);
        if (t == null)
            if (u < 3 && Nt(s.d, l - n, k, u))
                T.precision = l += 10, r = o = a = new T(1), g = 0, u++;
            else
                return F(s, T.precision = A, k, L = !0);
        else
            return T.precision = A, s;
    }
    s = a;
} }
function qe(e, t) { var r, n, i, o, s, a, l, u, g, h, T, k = 1, A = 10, S = e, I = S.d, _ = S.constructor, D = _.rounding, O = _.precision; if (S.s < 0 || !I || !I[0] || !S.e && I[0] == 1 && I.length == 1)
    return new _(I && !I[0] ? -1 / 0 : S.s != 1 ? NaN : I ? 0 : S); if (t == null ? (L = !1, g = O) : g = t, _.precision = g += A, r = Z(I), n = r.charAt(0), Math.abs(o = S.e) < 15e14) {
    for (; n < 7 && n != 1 || n == 1 && r.charAt(1) > 3;)
        S = S.times(e), r = Z(S.d), n = r.charAt(0), k++;
    o = S.e, n > 1 ? (S = new _("0." + r), o++) : S = new _(n + "." + r.slice(1));
}
else
    return u = gr(_, g + 2, O).times(o + ""), S = qe(new _(n + "." + r.slice(1)), g - A).plus(u), _.precision = O, t == null ? F(S, O, D, L = !0) : S; for (h = S, l = s = S = j(S.minus(1), S.plus(1), g, 1), T = F(S.times(S), g, 1), i = 3;;) {
    if (s = F(s.times(T), g, 1), u = l.plus(j(s, new _(i), g, 1)), Z(u.d).slice(0, g) === Z(l.d).slice(0, g))
        if (l = l.times(2), o !== 0 && (l = l.plus(gr(_, g + 2, O).times(o + ""))), l = j(l, new _(k), g, 1), t == null)
            if (Nt(l.d, g - A, D, a))
                _.precision = g += A, u = s = S = j(h.minus(1), h.plus(1), g, 1), T = F(S.times(S), g, 1), i = a = 1;
            else
                return F(l, _.precision = O, D, L = !0);
        else
            return _.precision = O, l;
    l = u, i += 2;
} }
function fo(e) { return String(e.s * e.s / 0); }
function dr(e, t) { var r, n, i; for ((r = t.indexOf(".")) > -1 && (t = t.replace(".", "")), (n = t.search(/e/i)) > 0 ? (r < 0 && (r = n), r += +t.slice(n + 1), t = t.substring(0, n)) : r < 0 && (r = t.length), n = 0; t.charCodeAt(n) === 48; n++)
    ; for (i = t.length; t.charCodeAt(i - 1) === 48; --i)
    ; if (t = t.slice(n, i), t) {
    if (i -= n, e.e = r = r - n - 1, e.d = [], n = (r + 1) % M, r < 0 && (n += M), n < i) {
        for (n && e.d.push(+t.slice(0, n)), i -= M; n < i;)
            e.d.push(+t.slice(n, n += M));
        t = t.slice(n), n = M - t.length;
    }
    else
        n -= i;
    for (; n--;)
        t += "0";
    e.d.push(+t), L && (e.e > e.constructor.maxE ? (e.d = null, e.e = NaN) : e.e < e.constructor.minE && (e.e = 0, e.d = [0]));
}
else
    e.e = 0, e.d = [0]; return e; }
function lu(e, t) { var r, n, i, o, s, a, l, u, g; if (t.indexOf("_") > -1) {
    if (t = t.replace(/(\d)_(?=\d)/g, "$1"), uo.test(t))
        return dr(e, t);
}
else if (t === "Infinity" || t === "NaN")
    return +t || (e.s = NaN), e.e = NaN, e.d = null, e; if (nu.test(t))
    r = 16, t = t.toLowerCase();
else if (ru.test(t))
    r = 2;
else if (iu.test(t))
    r = 8;
else
    throw Error($e + t); for (o = t.search(/p/i), o > 0 ? (l = +t.slice(o + 1), t = t.substring(2, o)) : t = t.slice(2), o = t.indexOf("."), s = o >= 0, n = e.constructor, s && (t = t.replace(".", ""), a = t.length, o = a - o, i = po(n, new n(r), o, o * 2)), u = pr(t, r, me), g = u.length - 1, o = g; u[o] === 0; --o)
    u.pop(); return o < 0 ? new n(e.s * 0) : (e.e = yr(u, g), e.d = u, L = !1, s && (e = j(e, i, a * 4)), l && (e = e.times(Math.abs(l) < 54 ? W(2, l) : He.pow(2, l))), L = !0, e); }
function uu(e, t) { var r, n = t.d.length; if (n < 3)
    return t.isZero() ? t : at(e, 2, t, t); r = 1.4 * Math.sqrt(n), r = r > 16 ? 16 : r | 0, t = t.times(1 / wr(5, r)), t = at(e, 2, t, t); for (var i, o = new e(5), s = new e(16), a = new e(20); r--;)
    i = t.times(t), t = t.times(o.plus(i.times(s.times(i).minus(a)))); return t; }
function at(e, t, r, n, i) { var o, s, a, l, u = 1, g = e.precision, h = Math.ceil(g / M); for (L = !1, l = r.times(r), a = new e(n);;) {
    if (s = j(a.times(l), new e(t++ * t++), g, 1), a = i ? n.plus(s) : n.minus(s), n = j(s.times(l), new e(t++ * t++), g, 1), s = a.plus(n), s.d[h] !== void 0) {
        for (o = h; s.d[o] === a.d[o] && o--;)
            ;
        if (o == -1)
            break;
    }
    o = a, a = n, n = s, s = o, u++;
} return L = !0, s.d.length = h + 1, s; }
function wr(e, t) { for (var r = e; --t;)
    r *= e; return r; }
function go(e, t) { var r, n = t.s < 0, i = we(e, e.precision, 1), o = i.times(.5); if (t = t.abs(), t.lte(o))
    return _e = n ? 4 : 1, t; if (r = t.divToInt(i), r.isZero())
    _e = n ? 3 : 2;
else {
    if (t = t.minus(r.times(i)), t.lte(o))
        return _e = ro(r) ? n ? 2 : 3 : n ? 4 : 1, t;
    _e = ro(r) ? n ? 1 : 4 : n ? 3 : 2;
} return t.minus(i).abs(); }
function On(e, t, r, n) { var i, o, s, a, l, u, g, h, T, k = e.constructor, A = r !== void 0; if (A ? (ae(r, 1, Be), n === void 0 ? n = k.rounding : ae(n, 0, 8)) : (r = k.precision, n = k.rounding), !e.isFinite())
    g = fo(e);
else {
    for (g = be(e), s = g.indexOf("."), A ? (i = 2, t == 16 ? r = r * 4 - 3 : t == 8 && (r = r * 3 - 2)) : i = t, s >= 0 && (g = g.replace(".", ""), T = new k(1), T.e = g.length - s, T.d = pr(be(T), 10, i), T.e = T.d.length), h = pr(g, 10, i), o = l = h.length; h[--l] == 0;)
        h.pop();
    if (!h[0])
        g = A ? "0p+0" : "0";
    else {
        if (s < 0 ? o-- : (e = new k(e), e.d = h, e.e = o, e = j(e, T, r, n, 0, i), h = e.d, o = e.e, u = oo), s = h[r], a = i / 2, u = u || h[r + 1] !== void 0, u = n < 4 ? (s !== void 0 || u) && (n === 0 || n === (e.s < 0 ? 3 : 2)) : s > a || s === a && (n === 4 || u || n === 6 && h[r - 1] & 1 || n === (e.s < 0 ? 8 : 7)), h.length = r, u)
            for (; ++h[--r] > i - 1;)
                h[r] = 0, r || (++o, h.unshift(1));
        for (l = h.length; !h[l - 1]; --l)
            ;
        for (s = 0, g = ""; s < l; s++)
            g += An.charAt(h[s]);
        if (A) {
            if (l > 1)
                if (t == 16 || t == 8) {
                    for (s = t == 16 ? 4 : 3, --l; l % s; l++)
                        g += "0";
                    for (h = pr(g, i, t), l = h.length; !h[l - 1]; --l)
                        ;
                    for (s = 1, g = "1."; s < l; s++)
                        g += An.charAt(h[s]);
                }
                else
                    g = g.charAt(0) + "." + g.slice(1);
            g = g + (o < 0 ? "p" : "p+") + o;
        }
        else if (o < 0) {
            for (; ++o;)
                g = "0" + g;
            g = "0." + g;
        }
        else if (++o > l)
            for (o -= l; o--;)
                g += "0";
        else
            o < l && (g = g.slice(0, o) + "." + g.slice(o));
    }
    g = (t == 16 ? "0x" : t == 2 ? "0b" : t == 8 ? "0o" : "") + g;
} return e.s < 0 ? "-" + g : g; }
function no(e, t) { if (e.length > t)
    return e.length = t, !0; }
function cu(e) { return new this(e).abs(); }
function pu(e) { return new this(e).acos(); }
function du(e) { return new this(e).acosh(); }
function mu(e, t) { return new this(e).plus(t); }
function fu(e) { return new this(e).asin(); }
function gu(e) { return new this(e).asinh(); }
function hu(e) { return new this(e).atan(); }
function yu(e) { return new this(e).atanh(); }
function wu(e, t) { e = new this(e), t = new this(t); var r, n = this.precision, i = this.rounding, o = n + 4; return !e.s || !t.s ? r = new this(NaN) : !e.d && !t.d ? (r = we(this, o, 1).times(t.s > 0 ? .25 : .75), r.s = e.s) : !t.d || e.isZero() ? (r = t.s < 0 ? we(this, n, i) : new this(0), r.s = e.s) : !e.d || t.isZero() ? (r = we(this, o, 1).times(.5), r.s = e.s) : t.s < 0 ? (this.precision = o, this.rounding = 1, r = this.atan(j(e, t, o, 1)), t = we(this, o, 1), this.precision = n, this.rounding = i, r = e.s < 0 ? r.minus(t) : r.plus(t)) : r = this.atan(j(e, t, o, 1)), r; }
function bu(e) { return new this(e).cbrt(); }
function Eu(e) { return F(e = new this(e), e.e + 1, 2); }
function xu(e, t, r) { return new this(e).clamp(t, r); }
function Pu(e) { if (!e || typeof e != "object")
    throw Error(hr + "Object expected"); var t, r, n, i = e.defaults === !0, o = ["precision", 1, Be, "rounding", 0, 8, "toExpNeg", -st, 0, "toExpPos", 0, st, "maxE", 0, st, "minE", -st, 0, "modulo", 0, 9]; for (t = 0; t < o.length; t += 3)
    if (r = o[t], i && (this[r] = Sn[r]), (n = e[r]) !== void 0)
        if (re(n) === n && n >= o[t + 1] && n <= o[t + 2])
            this[r] = n;
        else
            throw Error($e + r + ": " + n); if (r = "crypto", i && (this[r] = Sn[r]), (n = e[r]) !== void 0)
    if (n === !0 || n === !1 || n === 0 || n === 1)
        if (n)
            if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                this[r] = !0;
            else
                throw Error(ao);
        else
            this[r] = !1;
    else
        throw Error($e + r + ": " + n); return this; }
function vu(e) { return new this(e).cos(); }
function Tu(e) { return new this(e).cosh(); }
function ho(e) { var t, r, n; function i(o) { var s, a, l, u = this; if (!(u instanceof i))
    return new i(o); if (u.constructor = i, io(o)) {
    u.s = o.s, L ? !o.d || o.e > i.maxE ? (u.e = NaN, u.d = null) : o.e < i.minE ? (u.e = 0, u.d = [0]) : (u.e = o.e, u.d = o.d.slice()) : (u.e = o.e, u.d = o.d ? o.d.slice() : o.d);
    return;
} if (l = typeof o, l === "number") {
    if (o === 0) {
        u.s = 1 / o < 0 ? -1 : 1, u.e = 0, u.d = [0];
        return;
    }
    if (o < 0 ? (o = -o, u.s = -1) : u.s = 1, o === ~~o && o < 1e7) {
        for (s = 0, a = o; a >= 10; a /= 10)
            s++;
        L ? s > i.maxE ? (u.e = NaN, u.d = null) : s < i.minE ? (u.e = 0, u.d = [0]) : (u.e = s, u.d = [o]) : (u.e = s, u.d = [o]);
        return;
    }
    if (o * 0 !== 0) {
        o || (u.s = NaN), u.e = NaN, u.d = null;
        return;
    }
    return dr(u, o.toString());
} if (l === "string")
    return (a = o.charCodeAt(0)) === 45 ? (o = o.slice(1), u.s = -1) : (a === 43 && (o = o.slice(1)), u.s = 1), uo.test(o) ? dr(u, o) : lu(u, o); if (l === "bigint")
    return o < 0 ? (o = -o, u.s = -1) : u.s = 1, dr(u, o.toString()); throw Error($e + o); } if (i.prototype = R, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.EUCLID = 9, i.config = i.set = Pu, i.clone = ho, i.isDecimal = io, i.abs = cu, i.acos = pu, i.acosh = du, i.add = mu, i.asin = fu, i.asinh = gu, i.atan = hu, i.atanh = yu, i.atan2 = wu, i.cbrt = bu, i.ceil = Eu, i.clamp = xu, i.cos = vu, i.cosh = Tu, i.div = Cu, i.exp = Au, i.floor = Su, i.hypot = Ru, i.ln = ku, i.log = Ou, i.log10 = Fu, i.log2 = Iu, i.max = Mu, i.min = _u, i.mod = Lu, i.mul = Du, i.pow = Nu, i.random = qu, i.round = $u, i.sign = Bu, i.sin = ju, i.sinh = Uu, i.sqrt = Vu, i.sub = Qu, i.sum = Gu, i.tan = Ju, i.tanh = Wu, i.trunc = Ku, e === void 0 && (e = {}), e && e.defaults !== !0)
    for (n = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], t = 0; t < n.length;)
        e.hasOwnProperty(r = n[t++]) || (e[r] = this[r]); return i.config(e), i; }
function Cu(e, t) { return new this(e).div(t); }
function Au(e) { return new this(e).exp(); }
function Su(e) { return F(e = new this(e), e.e + 1, 3); }
function Ru() { var e, t, r = new this(0); for (L = !1, e = 0; e < arguments.length;)
    if (t = new this(arguments[e++]), t.d)
        r.d && (r = r.plus(t.times(t)));
    else {
        if (t.s)
            return L = !0, new this(1 / 0);
        r = t;
    } return L = !0, r.sqrt(); }
function io(e) { return e instanceof He || e && e.toStringTag === lo || !1; }
function ku(e) { return new this(e).ln(); }
function Ou(e, t) { return new this(e).log(t); }
function Iu(e) { return new this(e).log(2); }
function Fu(e) { return new this(e).log(10); }
function Mu() { return mo(this, arguments, -1); }
function _u() { return mo(this, arguments, 1); }
function Lu(e, t) { return new this(e).mod(t); }
function Du(e, t) { return new this(e).mul(t); }
function Nu(e, t) { return new this(e).pow(t); }
function qu(e) { var t, r, n, i, o = 0, s = new this(1), a = []; if (e === void 0 ? e = this.precision : ae(e, 1, Be), n = Math.ceil(e / M), this.crypto)
    if (crypto.getRandomValues)
        for (t = crypto.getRandomValues(new Uint32Array(n)); o < n;)
            i = t[o], i >= 429e7 ? t[o] = crypto.getRandomValues(new Uint32Array(1))[0] : a[o++] = i % 1e7;
    else if (crypto.randomBytes) {
        for (t = crypto.randomBytes(n *= 4); o < n;)
            i = t[o] + (t[o + 1] << 8) + (t[o + 2] << 16) + ((t[o + 3] & 127) << 24), i >= 214e7 ? crypto.randomBytes(4).copy(t, o) : (a.push(i % 1e7), o += 4);
        o = n / 4;
    }
    else
        throw Error(ao);
else
    for (; o < n;)
        a[o++] = Math.random() * 1e7 | 0; for (n = a[--o], e %= M, n && e && (i = W(10, M - e), a[o] = (n / i | 0) * i); a[o] === 0; o--)
    a.pop(); if (o < 0)
    r = 0, a = [0];
else {
    for (r = -1; a[0] === 0; r -= M)
        a.shift();
    for (n = 1, i = a[0]; i >= 10; i /= 10)
        n++;
    n < M && (r -= M - n);
} return s.e = r, s.d = a, s; }
function $u(e) { return F(e = new this(e), e.e + 1, this.rounding); }
function Bu(e) { return e = new this(e), e.d ? e.d[0] ? e.s : 0 * e.s : e.s || NaN; }
function ju(e) { return new this(e).sin(); }
function Uu(e) { return new this(e).sinh(); }
function Vu(e) { return new this(e).sqrt(); }
function Qu(e, t) { return new this(e).sub(t); }
function Gu() { var e = 0, t = arguments, r = new this(t[e]); for (L = !1; r.s && ++e < t.length;)
    r = r.plus(t[e]); return L = !0, F(r, this.precision, this.rounding); }
function Ju(e) { return new this(e).tan(); }
function Wu(e) { return new this(e).tanh(); }
function Ku(e) { return F(e = new this(e), e.e + 1, 1); }
R[Symbol.for("nodejs.util.inspect.custom")] = R.toString;
R[Symbol.toStringTag] = "Decimal";
var He = R.constructor = ho(Sn);
mr = new He(mr);
fr = new He(fr);
var Ee = He;
function lt(e) { return e === null ? e : Array.isArray(e) ? e.map(lt) : typeof e == "object" ? Hu(e) ? zu(e) : e.constructor !== null && e.constructor.name !== "Object" ? e : ot(e, lt) : e; }
function Hu(e) { return e !== null && typeof e == "object" && typeof e.$type == "string"; }
function zu({ $type: e, value: t }) { switch (e) {
    case "BigInt": return BigInt(t);
    case "Bytes": {
        let { buffer: r, byteOffset: n, byteLength: i } = w.Buffer.from(t, "base64");
        return new Uint8Array(r, n, i);
    }
    case "DateTime": return new Date(t);
    case "Decimal": return new Ee(t);
    case "Json": return JSON.parse(t);
    default: Me(t, "Unknown tagged value");
} }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var xe = class {
    constructor() {
        this._map = new Map;
    }
    get(t) { return this._map.get(t)?.value; }
    set(t, r) { this._map.set(t, { value: r }); }
    getOrCreate(t, r) { let n = this._map.get(t); if (n)
        return n.value; let i = r(); return this.set(t, i), i; }
};
f();
c();
p();
d();
m();
function je(e) { return e.substring(0, 1).toLowerCase() + e.substring(1); }
f();
c();
p();
d();
m();
function yo(e, t) { let r = {}; for (let n of e) {
    let i = n[t];
    r[i] = n;
} return r; }
f();
c();
p();
d();
m();
function qt(e) { let t; return { get() { return t || (t = { value: e() }), t.value; } }; }
f();
c();
p();
d();
m();
function wo(e) { return { models: In(e.models), enums: In(e.enums), types: In(e.types) }; }
function In(e) { let t = {}; for (let { name: r, ...n } of e)
    t[r] = n; return t; }
f();
c();
p();
d();
m();
function ut(e) { return e instanceof Date || Object.prototype.toString.call(e) === "[object Date]"; }
function br(e) { return e.toString() !== "Invalid Date"; }
f();
c();
p();
d();
m();
function ct(e) { return He.isDecimal(e) ? !0 : e !== null && typeof e == "object" && typeof e.s == "number" && typeof e.e == "number" && typeof e.toFixed == "function" && Array.isArray(e.d); }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var $t = {};
Xe($t, { ModelAction: () => pt, datamodelEnumToSchemaEnum: () => Yu });
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
function Yu(e) { return { name: e.name, values: e.values.map(t => t.name) }; }
f();
c();
p();
d();
m();
var pt = (O => (O.findUnique = "findUnique", O.findUniqueOrThrow = "findUniqueOrThrow", O.findFirst = "findFirst", O.findFirstOrThrow = "findFirstOrThrow", O.findMany = "findMany", O.create = "create", O.createMany = "createMany", O.createManyAndReturn = "createManyAndReturn", O.update = "update", O.updateMany = "updateMany", O.updateManyAndReturn = "updateManyAndReturn", O.upsert = "upsert", O.delete = "delete", O.deleteMany = "deleteMany", O.groupBy = "groupBy", O.count = "count", O.aggregate = "aggregate", O.findRaw = "findRaw", O.aggregateRaw = "aggregateRaw", O))(pt || {});
var Po = Re(Ki());
f();
c();
p();
d();
m();
mn();
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var bo = { keyword: Oe, entity: Oe, value: e => de(We(e)), punctuation: We, directive: Oe, function: Oe, variable: e => de(We(e)), string: e => de(kt(e)), boolean: Ot, number: Oe, comment: It };
var Zu = e => e, Er = {}, Xu = 0, N = { manual: Er.Prism && Er.Prism.manual, disableWorkerMessageHandler: Er.Prism && Er.Prism.disableWorkerMessageHandler, util: { encode: function (e) { if (e instanceof fe) {
            let t = e;
            return new fe(t.type, N.util.encode(t.content), t.alias);
        }
        else
            return Array.isArray(e) ? e.map(N.util.encode) : e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " "); }, type: function (e) { return Object.prototype.toString.call(e).slice(8, -1); }, objId: function (e) { return e.__id || Object.defineProperty(e, "__id", { value: ++Xu }), e.__id; }, clone: function e(t, r) { let n, i, o = N.util.type(t); switch (r = r || {}, o) {
            case "Object":
                if (i = N.util.objId(t), r[i])
                    return r[i];
                n = {}, r[i] = n;
                for (let s in t)
                    t.hasOwnProperty(s) && (n[s] = e(t[s], r));
                return n;
            case "Array": return i = N.util.objId(t), r[i] ? r[i] : (n = [], r[i] = n, t.forEach(function (s, a) { n[a] = e(s, r); }), n);
            default: return t;
        } } }, languages: { extend: function (e, t) { let r = N.util.clone(N.languages[e]); for (let n in t)
            r[n] = t[n]; return r; }, insertBefore: function (e, t, r, n) { n = n || N.languages; let i = n[e], o = {}; for (let a in i)
            if (i.hasOwnProperty(a)) {
                if (a == t)
                    for (let l in r)
                        r.hasOwnProperty(l) && (o[l] = r[l]);
                r.hasOwnProperty(a) || (o[a] = i[a]);
            } let s = n[e]; return n[e] = o, N.languages.DFS(N.languages, function (a, l) { l === s && a != e && (this[a] = o); }), o; }, DFS: function e(t, r, n, i) { i = i || {}; let o = N.util.objId; for (let s in t)
            if (t.hasOwnProperty(s)) {
                r.call(t, s, t[s], n || s);
                let a = t[s], l = N.util.type(a);
                l === "Object" && !i[o(a)] ? (i[o(a)] = !0, e(a, r, null, i)) : l === "Array" && !i[o(a)] && (i[o(a)] = !0, e(a, r, s, i));
            } } }, plugins: {}, highlight: function (e, t, r) { let n = { code: e, grammar: t, language: r }; return N.hooks.run("before-tokenize", n), n.tokens = N.tokenize(n.code, n.grammar), N.hooks.run("after-tokenize", n), fe.stringify(N.util.encode(n.tokens), n.language); }, matchGrammar: function (e, t, r, n, i, o, s) { for (let S in r) {
        if (!r.hasOwnProperty(S) || !r[S])
            continue;
        if (S == s)
            return;
        let I = r[S];
        I = N.util.type(I) === "Array" ? I : [I];
        for (let _ = 0; _ < I.length; ++_) {
            let D = I[_], O = D.inside, q = !!D.lookbehind, Y = !!D.greedy, U = 0, Ct = D.alias;
            if (Y && !D.pattern.global) {
                let G = D.pattern.toString().match(/[imuy]*$/)[0];
                D.pattern = RegExp(D.pattern.source, G + "g");
            }
            D = D.pattern || D;
            for (let G = n, ie = i; G < t.length; ie += t[G].length, ++G) {
                let Ae = t[G];
                if (t.length > e.length)
                    return;
                if (Ae instanceof fe)
                    continue;
                if (Y && G != t.length - 1) {
                    D.lastIndex = ie;
                    var h = D.exec(e);
                    if (!h)
                        break;
                    var g = h.index + (q ? h[1].length : 0), T = h.index + h[0].length, a = G, l = ie;
                    for (let B = t.length; a < B && (l < T || !t[a].type && !t[a - 1].greedy); ++a)
                        l += t[a].length, g >= l && (++G, ie = l);
                    if (t[G] instanceof fe)
                        continue;
                    u = a - G, Ae = e.slice(ie, l), h.index -= ie;
                }
                else {
                    D.lastIndex = 0;
                    var h = D.exec(Ae), u = 1;
                }
                if (!h) {
                    if (o)
                        break;
                    continue;
                }
                q && (U = h[1] ? h[1].length : 0);
                var g = h.index + U, h = h[0].slice(U), T = g + h.length, k = Ae.slice(0, g), A = Ae.slice(T);
                let X = [G, u];
                k && (++G, ie += k.length, X.push(k));
                let Ze = new fe(S, O ? N.tokenize(h, O) : h, Ct, h, Y);
                if (X.push(Ze), A && X.push(A), Array.prototype.splice.apply(t, X), u != 1 && N.matchGrammar(e, t, r, G, ie, !0, S), o)
                    break;
            }
        }
    } }, tokenize: function (e, t) { let r = [e], n = t.rest; if (n) {
        for (let i in n)
            t[i] = n[i];
        delete t.rest;
    } return N.matchGrammar(e, r, t, 0, 0, !1), r; }, hooks: { all: {}, add: function (e, t) { let r = N.hooks.all; r[e] = r[e] || [], r[e].push(t); }, run: function (e, t) { let r = N.hooks.all[e]; if (!(!r || !r.length))
            for (var n = 0, i; i = r[n++];)
                i(t); } }, Token: fe };
N.languages.clike = { comment: [{ pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/, lookbehind: !0 }, { pattern: /(^|[^\\:])\/\/.*/, lookbehind: !0, greedy: !0 }], string: { pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: !0 }, "class-name": { pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i, lookbehind: !0, inside: { punctuation: /[.\\]/ } }, keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/, boolean: /\b(?:true|false)\b/, function: /\w+(?=\()/, number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i, operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/, punctuation: /[{}[\];(),.:]/ };
N.languages.javascript = N.languages.extend("clike", { "class-name": [N.languages.clike["class-name"], { pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/, lookbehind: !0 }], keyword: [{ pattern: /((?:^|})\s*)(?:catch|finally)\b/, lookbehind: !0 }, { pattern: /(^|[^.])\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/, lookbehind: !0 }], number: /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/, function: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/, operator: /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/ });
N.languages.javascript["class-name"][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;
N.languages.insertBefore("javascript", "keyword", { regex: { pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=\s*($|[\r\n,.;})\]]))/, lookbehind: !0, greedy: !0 }, "function-variable": { pattern: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/, alias: "function" }, parameter: [{ pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/, lookbehind: !0, inside: N.languages.javascript }, { pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i, inside: N.languages.javascript }, { pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/, lookbehind: !0, inside: N.languages.javascript }, { pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/, lookbehind: !0, inside: N.languages.javascript }], constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/ });
N.languages.markup && N.languages.markup.tag.addInlined("script", "javascript");
N.languages.js = N.languages.javascript;
N.languages.typescript = N.languages.extend("javascript", { keyword: /\b(?:abstract|as|async|await|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|is|keyof|let|module|namespace|new|null|of|package|private|protected|public|readonly|return|require|set|static|super|switch|this|throw|try|type|typeof|var|void|while|with|yield)\b/, builtin: /\b(?:string|Function|any|number|boolean|Array|symbol|console|Promise|unknown|never)\b/ });
N.languages.ts = N.languages.typescript;
function fe(e, t, r, n, i) { this.type = e, this.content = t, this.alias = r, this.length = (n || "").length | 0, this.greedy = !!i; }
fe.stringify = function (e, t) { return typeof e == "string" ? e : Array.isArray(e) ? e.map(function (r) { return fe.stringify(r, t); }).join("") : ec(e.type)(e.content); };
function ec(e) { return bo[e] || Zu; }
function Eo(e) { return tc(e, N.languages.javascript); }
function tc(e, t) { return N.tokenize(e, t).map(n => fe.stringify(n)).join(""); }
f();
c();
p();
d();
m();
function xo(e) { return bn(e); }
var xr = class e {
    static read(t) { let r; try {
        r = sr.readFileSync(t, "utf-8");
    }
    catch {
        return null;
    } return e.fromContent(r); }
    static fromContent(t) { let r = t.split(/\r?\n/); return new e(1, r); }
    constructor(t, r) { this.firstLineNumber = t, this.lines = r; }
    get lastLineNumber() { return this.firstLineNumber + this.lines.length - 1; }
    mapLineAt(t, r) { if (t < this.firstLineNumber || t > this.lines.length + this.firstLineNumber)
        return this; let n = t - this.firstLineNumber, i = [...this.lines]; return i[n] = r(i[n]), new e(this.firstLineNumber, i); }
    mapLines(t) { return new e(this.firstLineNumber, this.lines.map((r, n) => t(r, this.firstLineNumber + n))); }
    lineAt(t) { return this.lines[t - this.firstLineNumber]; }
    prependSymbolAt(t, r) { return this.mapLines((n, i) => i === t ? `${r} ${n}` : `  ${n}`); }
    slice(t, r) {
        let n = this.lines.slice(t - 1, r).join(`
`);
        return new e(t, xo(n).split(`
`));
    }
    highlight() {
        let t = Eo(this.toString());
        return new e(this.firstLineNumber, t.split(`
`));
    }
    toString() {
        return this.lines.join(`
`);
    }
};
var rc = { red: Je, gray: It, dim: St, bold: de, underline: Rt, highlightSource: e => e.highlight() }, nc = { red: e => e, gray: e => e, dim: e => e, bold: e => e, underline: e => e, highlightSource: e => e };
function ic({ message: e, originalMethod: t, isPanic: r, callArguments: n }) { return { functionName: `prisma.${t}()`, message: e, isPanic: r ?? !1, callArguments: n }; }
function oc({ callsite: e, message: t, originalMethod: r, isPanic: n, callArguments: i }, o) { let s = ic({ message: t, originalMethod: r, isPanic: n, callArguments: i }); if (!e || typeof window < "u" || y.env.NODE_ENV === "production")
    return s; let a = e.getLocation(); if (!a || !a.lineNumber || !a.columnNumber)
    return s; let l = Math.max(1, a.lineNumber - 3), u = xr.read(a.fileName)?.slice(l, a.lineNumber), g = u?.lineAt(a.lineNumber); if (u && g) {
    let h = ac(g), T = sc(g);
    if (!T)
        return s;
    s.functionName = `${T.code})`, s.location = a, n || (u = u.mapLineAt(a.lineNumber, A => A.slice(0, T.openingBraceIndex))), u = o.highlightSource(u);
    let k = String(u.lastLineNumber).length;
    if (s.contextLines = u.mapLines((A, S) => o.gray(String(S).padStart(k)) + " " + A).mapLines(A => o.dim(A)).prependSymbolAt(a.lineNumber, o.bold(o.red("\u2192"))), i) {
        let A = h + k + 1;
        A += 2, s.callArguments = (0, Po.default)(i, A).slice(A);
    }
} return s; }
function sc(e) { let t = Object.keys(pt).join("|"), n = new RegExp(String.raw `\.(${t})\(`).exec(e); if (n) {
    let i = n.index + n[0].length, o = e.lastIndexOf(" ", n.index) + 1;
    return { code: e.slice(o, i), openingBraceIndex: i };
} return null; }
function ac(e) { let t = 0; for (let r = 0; r < e.length; r++) {
    if (e.charAt(r) !== " ")
        return t;
    t++;
} return t; }
function lc({ functionName: e, location: t, message: r, isPanic: n, contextLines: i, callArguments: o }, s) {
    let a = [""], l = t ? " in" : ":";
    if (n ? (a.push(s.red(`Oops, an unknown error occurred! This is ${s.bold("on us")}, you did nothing wrong.`)), a.push(s.red(`It occurred in the ${s.bold(`\`${e}\``)} invocation${l}`))) : a.push(s.red(`Invalid ${s.bold(`\`${e}\``)} invocation${l}`)), t && a.push(s.underline(uc(t))), i) {
        a.push("");
        let u = [i.toString()];
        o && (u.push(o), u.push(s.dim(")"))), a.push(u.join("")), o && a.push("");
    }
    else
        a.push(""), o && a.push(o), a.push("");
    return a.push(r), a.join(`
`);
}
function uc(e) { let t = [e.fileName]; return e.lineNumber && t.push(String(e.lineNumber)), e.columnNumber && t.push(String(e.columnNumber)), t.join(":"); }
function Pr(e) { let t = e.showColors ? rc : nc, r; return r = oc(e, t), lc(r, t); }
f();
c();
p();
d();
m();
var Io = Re(Fn());
f();
c();
p();
d();
m();
function Ao(e, t, r) { let n = So(e), i = cc(n), o = dc(i); o ? vr(o, t, r) : t.addErrorMessage(() => "Unknown error"); }
function So(e) { return e.errors.flatMap(t => t.kind === "Union" ? So(t) : [t]); }
function cc(e) { let t = new Map, r = []; for (let n of e) {
    if (n.kind !== "InvalidArgumentType") {
        r.push(n);
        continue;
    }
    let i = `${n.selectionPath.join(".")}:${n.argumentPath.join(".")}`, o = t.get(i);
    o ? t.set(i, { ...n, argument: { ...n.argument, typeNames: pc(o.argument.typeNames, n.argument.typeNames) } }) : t.set(i, n);
} return r.push(...t.values()), r; }
function pc(e, t) { return [...new Set(e.concat(t))]; }
function dc(e) { return Cn(e, (t, r) => { let n = To(t), i = To(r); return n !== i ? n - i : Co(t) - Co(r); }); }
function To(e) { let t = 0; return Array.isArray(e.selectionPath) && (t += e.selectionPath.length), Array.isArray(e.argumentPath) && (t += e.argumentPath.length), t; }
function Co(e) { switch (e.kind) {
    case "InvalidArgumentValue":
    case "ValueTooLarge": return 20;
    case "InvalidArgumentType": return 10;
    case "RequiredArgumentMissing": return -10;
    default: return 0;
} }
f();
c();
p();
d();
m();
var pe = class {
    constructor(t, r) {
        this.isRequired = !1;
        this.name = t;
        this.value = r;
    }
    makeRequired() { return this.isRequired = !0, this; }
    write(t) { let { colors: { green: r } } = t.context; t.addMarginSymbol(r(this.isRequired ? "+" : "?")), t.write(r(this.name)), this.isRequired || t.write(r("?")), t.write(r(": ")), typeof this.value == "string" ? t.write(r(this.value)) : t.write(this.value); }
};
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
ko();
f();
c();
p();
d();
m();
var dt = class {
    constructor(t = 0, r) {
        this.lines = [];
        this.currentLine = "";
        this.currentIndent = 0;
        this.context = r;
        this.currentIndent = t;
    }
    write(t) { return typeof t == "string" ? this.currentLine += t : t.write(this), this; }
    writeJoined(t, r, n = (i, o) => o.write(i)) { let i = r.length - 1; for (let o = 0; o < r.length; o++)
        n(r[o], this), o !== i && this.write(t); return this; }
    writeLine(t) { return this.write(t).newLine(); }
    newLine() { this.lines.push(this.indentedCurrentLine()), this.currentLine = "", this.marginSymbol = void 0; let t = this.afterNextNewLineCallback; return this.afterNextNewLineCallback = void 0, t?.(), this; }
    withIndent(t) { return this.indent(), t(this), this.unindent(), this; }
    afterNextNewline(t) { return this.afterNextNewLineCallback = t, this; }
    indent() { return this.currentIndent++, this; }
    unindent() { return this.currentIndent > 0 && this.currentIndent--, this; }
    addMarginSymbol(t) { return this.marginSymbol = t, this; }
    toString() {
        return this.lines.concat(this.indentedCurrentLine()).join(`
`);
    }
    getCurrentLineLength() { return this.currentLine.length; }
    indentedCurrentLine() { let t = this.currentLine.padStart(this.currentLine.length + 2 * this.currentIndent); return this.marginSymbol ? this.marginSymbol + t.slice(1) : t; }
};
Ro();
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var Tr = class {
    constructor(t) { this.value = t; }
    write(t) { t.write(this.value); }
    markAsError() { this.value.markAsError(); }
};
f();
c();
p();
d();
m();
var Cr = e => e, Ar = { bold: Cr, red: Cr, green: Cr, dim: Cr, enabled: !1 }, Oo = { bold: de, red: Je, green: kt, dim: St, enabled: !0 }, mt = { write(e) { e.writeLine(","); } };
f();
c();
p();
d();
m();
var Pe = class {
    constructor(t) {
        this.isUnderlined = !1;
        this.color = t => t;
        this.contents = t;
    }
    underline() { return this.isUnderlined = !0, this; }
    setColor(t) { return this.color = t, this; }
    write(t) { let r = t.getCurrentLineLength(); t.write(this.color(this.contents)), this.isUnderlined && t.afterNextNewline(() => { t.write(" ".repeat(r)).writeLine(this.color("~".repeat(this.contents.length))); }); }
};
f();
c();
p();
d();
m();
var Ue = class {
    constructor() {
        this.hasError = !1;
    }
    markAsError() { return this.hasError = !0, this; }
};
var ft = class extends Ue {
    constructor() {
        super(...arguments);
        this.items = [];
    }
    addItem(t) { return this.items.push(new Tr(t)), this; }
    getField(t) { return this.items[t]; }
    getPrintWidth() { return this.items.length === 0 ? 2 : Math.max(...this.items.map(r => r.value.getPrintWidth())) + 2; }
    write(t) { if (this.items.length === 0) {
        this.writeEmpty(t);
        return;
    } this.writeWithItems(t); }
    writeEmpty(t) { let r = new Pe("[]"); this.hasError && r.setColor(t.context.colors.red).underline(), t.write(r); }
    writeWithItems(t) { let { colors: r } = t.context; t.writeLine("[").withIndent(() => t.writeJoined(mt, this.items).newLine()).write("]"), this.hasError && t.afterNextNewline(() => { t.writeLine(r.red("~".repeat(this.getPrintWidth()))); }); }
    asObject() { }
};
var gt = class e extends Ue {
    constructor() {
        super(...arguments);
        this.fields = {};
        this.suggestions = [];
    }
    addField(t) { this.fields[t.name] = t; }
    addSuggestion(t) { this.suggestions.push(t); }
    getField(t) { return this.fields[t]; }
    getDeepField(t) { let [r, ...n] = t, i = this.getField(r); if (!i)
        return; let o = i; for (let s of n) {
        let a;
        if (o.value instanceof e ? a = o.value.getField(s) : o.value instanceof ft && (a = o.value.getField(Number(s))), !a)
            return;
        o = a;
    } return o; }
    getDeepFieldValue(t) { return t.length === 0 ? this : this.getDeepField(t)?.value; }
    hasField(t) { return !!this.getField(t); }
    removeAllFields() { this.fields = {}; }
    removeField(t) { delete this.fields[t]; }
    getFields() { return this.fields; }
    isEmpty() { return Object.keys(this.fields).length === 0; }
    getFieldValue(t) { return this.getField(t)?.value; }
    getDeepSubSelectionValue(t) { let r = this; for (let n of t) {
        if (!(r instanceof e))
            return;
        let i = r.getSubSelectionValue(n);
        if (!i)
            return;
        r = i;
    } return r; }
    getDeepSelectionParent(t) { let r = this.getSelectionParent(); if (!r)
        return; let n = r; for (let i of t) {
        let o = n.value.getFieldValue(i);
        if (!o || !(o instanceof e))
            return;
        let s = o.getSelectionParent();
        if (!s)
            return;
        n = s;
    } return n; }
    getSelectionParent() { let t = this.getField("select")?.value.asObject(); if (t)
        return { kind: "select", value: t }; let r = this.getField("include")?.value.asObject(); if (r)
        return { kind: "include", value: r }; }
    getSubSelectionValue(t) { return this.getSelectionParent()?.value.fields[t].value; }
    getPrintWidth() { let t = Object.values(this.fields); return t.length == 0 ? 2 : Math.max(...t.map(n => n.getPrintWidth())) + 2; }
    write(t) { let r = Object.values(this.fields); if (r.length === 0 && this.suggestions.length === 0) {
        this.writeEmpty(t);
        return;
    } this.writeWithContents(t, r); }
    asObject() { return this; }
    writeEmpty(t) { let r = new Pe("{}"); this.hasError && r.setColor(t.context.colors.red).underline(), t.write(r); }
    writeWithContents(t, r) { t.writeLine("{").withIndent(() => { t.writeJoined(mt, [...r, ...this.suggestions]).newLine(); }), t.write("}"), this.hasError && t.afterNextNewline(() => { t.writeLine(t.context.colors.red("~".repeat(this.getPrintWidth()))); }); }
};
f();
c();
p();
d();
m();
var z = class extends Ue {
    constructor(r) { super(); this.text = r; }
    getPrintWidth() { return this.text.length; }
    write(r) { let n = new Pe(this.text); this.hasError && n.underline().setColor(r.context.colors.red), r.write(n); }
    asObject() { }
};
f();
c();
p();
d();
m();
var Bt = class {
    constructor() {
        this.fields = [];
    }
    addField(t, r) { return this.fields.push({ write(n) { let { green: i, dim: o } = n.context.colors; n.write(i(o(`${t}: ${r}`))).addMarginSymbol(i(o("+"))); } }), this; }
    write(t) { let { colors: { green: r } } = t.context; t.writeLine(r("{")).withIndent(() => { t.writeJoined(mt, this.fields).newLine(); }).write(r("}")).addMarginSymbol(r("+")); }
};
function vr(e, t, r) { switch (e.kind) {
    case "MutuallyExclusiveFields":
        mc(e, t);
        break;
    case "IncludeOnScalar":
        fc(e, t);
        break;
    case "EmptySelection":
        gc(e, t, r);
        break;
    case "UnknownSelectionField":
        bc(e, t);
        break;
    case "InvalidSelectionValue":
        Ec(e, t);
        break;
    case "UnknownArgument":
        xc(e, t);
        break;
    case "UnknownInputField":
        Pc(e, t);
        break;
    case "RequiredArgumentMissing":
        vc(e, t);
        break;
    case "InvalidArgumentType":
        Tc(e, t);
        break;
    case "InvalidArgumentValue":
        Cc(e, t);
        break;
    case "ValueTooLarge":
        Ac(e, t);
        break;
    case "SomeFieldsMissing":
        Sc(e, t);
        break;
    case "TooManyFieldsGiven":
        Rc(e, t);
        break;
    case "Union":
        Ao(e, t, r);
        break;
    default: throw new Error("not implemented: " + e.kind);
} }
function mc(e, t) { let r = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); r && (r.getField(e.firstField)?.markAsError(), r.getField(e.secondField)?.markAsError()), t.addErrorMessage(n => `Please ${n.bold("either")} use ${n.green(`\`${e.firstField}\``)} or ${n.green(`\`${e.secondField}\``)}, but ${n.red("not both")} at the same time.`); }
function fc(e, t) {
    let [r, n] = ht(e.selectionPath), i = e.outputType, o = t.arguments.getDeepSelectionParent(r)?.value;
    if (o && (o.getField(n)?.markAsError(), i))
        for (let s of i.fields)
            s.isRelation && o.addSuggestion(new pe(s.name, "true"));
    t.addErrorMessage(s => {
        let a = `Invalid scalar field ${s.red(`\`${n}\``)} for ${s.bold("include")} statement`;
        return i ? a += ` on model ${s.bold(i.name)}. ${jt(s)}` : a += ".", a += `
Note that ${s.bold("include")} statements only accept relation fields.`, a;
    });
}
function gc(e, t, r) { let n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); if (n) {
    let i = n.getField("omit")?.value.asObject();
    if (i) {
        hc(e, t, i);
        return;
    }
    if (n.hasField("select")) {
        yc(e, t);
        return;
    }
} if (r?.[je(e.outputType.name)]) {
    wc(e, t);
    return;
} t.addErrorMessage(() => `Unknown field at "${e.selectionPath.join(".")} selection"`); }
function hc(e, t, r) { r.removeAllFields(); for (let n of e.outputType.fields)
    r.addSuggestion(new pe(n.name, "false")); t.addErrorMessage(n => `The ${n.red("omit")} statement includes every field of the model ${n.bold(e.outputType.name)}. At least one field must be included in the result`); }
function yc(e, t) { let r = e.outputType, n = t.arguments.getDeepSelectionParent(e.selectionPath)?.value, i = n?.isEmpty() ?? !1; n && (n.removeAllFields(), _o(n, r)), t.addErrorMessage(o => i ? `The ${o.red("`select`")} statement for type ${o.bold(r.name)} must not be empty. ${jt(o)}` : `The ${o.red("`select`")} statement for type ${o.bold(r.name)} needs ${o.bold("at least one truthy value")}.`); }
function wc(e, t) { let r = new Bt; for (let i of e.outputType.fields)
    i.isRelation || r.addField(i.name, "false"); let n = new pe("omit", r).makeRequired(); if (e.selectionPath.length === 0)
    t.arguments.addSuggestion(n);
else {
    let [i, o] = ht(e.selectionPath), a = t.arguments.getDeepSelectionParent(i)?.value.asObject()?.getField(o);
    if (a) {
        let l = a?.value.asObject() ?? new gt;
        l.addSuggestion(n), a.value = l;
    }
} t.addErrorMessage(i => `The global ${i.red("omit")} configuration excludes every field of the model ${i.bold(e.outputType.name)}. At least one field must be included in the result`); }
function bc(e, t) { let r = Lo(e.selectionPath, t); if (r.parentKind !== "unknown") {
    r.field.markAsError();
    let n = r.parent;
    switch (r.parentKind) {
        case "select":
            _o(n, e.outputType);
            break;
        case "include":
            kc(n, e.outputType);
            break;
        case "omit":
            Oc(n, e.outputType);
            break;
    }
} t.addErrorMessage(n => { let i = [`Unknown field ${n.red(`\`${r.fieldName}\``)}`]; return r.parentKind !== "unknown" && i.push(`for ${n.bold(r.parentKind)} statement`), i.push(`on model ${n.bold(`\`${e.outputType.name}\``)}.`), i.push(jt(n)), i.join(" "); }); }
function Ec(e, t) { let r = Lo(e.selectionPath, t); r.parentKind !== "unknown" && r.field.value.markAsError(), t.addErrorMessage(n => `Invalid value for selection field \`${n.red(r.fieldName)}\`: ${e.underlyingError}`); }
function xc(e, t) { let r = e.argumentPath[0], n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); n && (n.getField(r)?.markAsError(), Ic(n, e.arguments)), t.addErrorMessage(i => Fo(i, r, e.arguments.map(o => o.name))); }
function Pc(e, t) { let [r, n] = ht(e.argumentPath), i = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); if (i) {
    i.getDeepField(e.argumentPath)?.markAsError();
    let o = i.getDeepFieldValue(r)?.asObject();
    o && Do(o, e.inputType);
} t.addErrorMessage(o => Fo(o, n, e.inputType.fields.map(s => s.name))); }
function Fo(e, t, r) { let n = [`Unknown argument \`${e.red(t)}\`.`], i = Mc(t, r); return i && n.push(`Did you mean \`${e.green(i)}\`?`), r.length > 0 && n.push(jt(e)), n.join(" "); }
function vc(e, t) { let r; t.addErrorMessage(l => r?.value instanceof z && r.value.text === "null" ? `Argument \`${l.green(o)}\` must not be ${l.red("null")}.` : `Argument \`${l.green(o)}\` is missing.`); let n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); if (!n)
    return; let [i, o] = ht(e.argumentPath), s = new Bt, a = n.getDeepFieldValue(i)?.asObject(); if (a) {
    if (r = a.getField(o), r && a.removeField(o), e.inputTypes.length === 1 && e.inputTypes[0].kind === "object") {
        for (let l of e.inputTypes[0].fields)
            s.addField(l.name, l.typeNames.join(" | "));
        a.addSuggestion(new pe(o, s).makeRequired());
    }
    else {
        let l = e.inputTypes.map(Mo).join(" | ");
        a.addSuggestion(new pe(o, l).makeRequired());
    }
    if (e.dependentArgumentPath) {
        n.getDeepField(e.dependentArgumentPath)?.markAsError();
        let [, l] = ht(e.dependentArgumentPath);
        t.addErrorMessage(u => `Argument \`${u.green(o)}\` is required because argument \`${u.green(l)}\` was provided.`);
    }
} }
function Mo(e) { return e.kind === "list" ? `${Mo(e.elementType)}[]` : e.name; }
function Tc(e, t) { let r = e.argument.name, n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); n && n.getDeepFieldValue(e.argumentPath)?.markAsError(), t.addErrorMessage(i => { let o = Sr("or", e.argument.typeNames.map(s => i.green(s))); return `Argument \`${i.bold(r)}\`: Invalid value provided. Expected ${o}, provided ${i.red(e.inferredType)}.`; }); }
function Cc(e, t) { let r = e.argument.name, n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); n && n.getDeepFieldValue(e.argumentPath)?.markAsError(), t.addErrorMessage(i => { let o = [`Invalid value for argument \`${i.bold(r)}\``]; if (e.underlyingError && o.push(`: ${e.underlyingError}`), o.push("."), e.argument.typeNames.length > 0) {
    let s = Sr("or", e.argument.typeNames.map(a => i.green(a)));
    o.push(` Expected ${s}.`);
} return o.join(""); }); }
function Ac(e, t) { let r = e.argument.name, n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(), i; if (n) {
    let s = n.getDeepField(e.argumentPath)?.value;
    s?.markAsError(), s instanceof z && (i = s.text);
} t.addErrorMessage(o => { let s = ["Unable to fit value"]; return i && s.push(o.red(i)), s.push(`into a 64-bit signed integer for field \`${o.bold(r)}\``), s.join(" "); }); }
function Sc(e, t) { let r = e.argumentPath[e.argumentPath.length - 1], n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); if (n) {
    let i = n.getDeepFieldValue(e.argumentPath)?.asObject();
    i && Do(i, e.inputType);
} t.addErrorMessage(i => { let o = [`Argument \`${i.bold(r)}\` of type ${i.bold(e.inputType.name)} needs`]; return e.constraints.minFieldCount === 1 ? e.constraints.requiredFields ? o.push(`${i.green("at least one of")} ${Sr("or", e.constraints.requiredFields.map(s => `\`${i.bold(s)}\``))} arguments.`) : o.push(`${i.green("at least one")} argument.`) : o.push(`${i.green(`at least ${e.constraints.minFieldCount}`)} arguments.`), o.push(jt(i)), o.join(" "); }); }
function Rc(e, t) { let r = e.argumentPath[e.argumentPath.length - 1], n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(), i = []; if (n) {
    let o = n.getDeepFieldValue(e.argumentPath)?.asObject();
    o && (o.markAsError(), i = Object.keys(o.getFields()));
} t.addErrorMessage(o => { let s = [`Argument \`${o.bold(r)}\` of type ${o.bold(e.inputType.name)} needs`]; return e.constraints.minFieldCount === 1 && e.constraints.maxFieldCount == 1 ? s.push(`${o.green("exactly one")} argument,`) : e.constraints.maxFieldCount == 1 ? s.push(`${o.green("at most one")} argument,`) : s.push(`${o.green(`at most ${e.constraints.maxFieldCount}`)} arguments,`), s.push(`but you provided ${Sr("and", i.map(a => o.red(a)))}. Please choose`), e.constraints.maxFieldCount === 1 ? s.push("one.") : s.push(`${e.constraints.maxFieldCount}.`), s.join(" "); }); }
function _o(e, t) { for (let r of t.fields)
    e.hasField(r.name) || e.addSuggestion(new pe(r.name, "true")); }
function kc(e, t) { for (let r of t.fields)
    r.isRelation && !e.hasField(r.name) && e.addSuggestion(new pe(r.name, "true")); }
function Oc(e, t) { for (let r of t.fields)
    !e.hasField(r.name) && !r.isRelation && e.addSuggestion(new pe(r.name, "true")); }
function Ic(e, t) { for (let r of t)
    e.hasField(r.name) || e.addSuggestion(new pe(r.name, r.typeNames.join(" | "))); }
function Lo(e, t) { let [r, n] = ht(e), i = t.arguments.getDeepSubSelectionValue(r)?.asObject(); if (!i)
    return { parentKind: "unknown", fieldName: n }; let o = i.getFieldValue("select")?.asObject(), s = i.getFieldValue("include")?.asObject(), a = i.getFieldValue("omit")?.asObject(), l = o?.getField(n); return o && l ? { parentKind: "select", parent: o, field: l, fieldName: n } : (l = s?.getField(n), s && l ? { parentKind: "include", field: l, parent: s, fieldName: n } : (l = a?.getField(n), a && l ? { parentKind: "omit", field: l, parent: a, fieldName: n } : { parentKind: "unknown", fieldName: n })); }
function Do(e, t) { if (t.kind === "object")
    for (let r of t.fields)
        e.hasField(r.name) || e.addSuggestion(new pe(r.name, r.typeNames.join(" | "))); }
function ht(e) { let t = [...e], r = t.pop(); if (!r)
    throw new Error("unexpected empty path"); return [t, r]; }
function jt({ green: e, enabled: t }) { return "Available options are " + (t ? `listed in ${e("green")}` : "marked with ?") + "."; }
function Sr(e, t) { if (t.length === 1)
    return t[0]; let r = [...t], n = r.pop(); return `${r.join(", ")} ${e} ${n}`; }
var Fc = 3;
function Mc(e, t) { let r = 1 / 0, n; for (let i of t) {
    let o = (0, Io.default)(e, i);
    o > Fc || o < r && (r = o, n = i);
} return n; }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var Ut = class {
    constructor(t, r, n, i, o) { this.modelName = t, this.name = r, this.typeName = n, this.isList = i, this.isEnum = o; }
    _toGraphQLInputType() { let t = this.isList ? "List" : "", r = this.isEnum ? "Enum" : ""; return `${t}${r}${this.typeName}FieldRefInput<${this.modelName}>`; }
};
function yt(e) { return e instanceof Ut; }
f();
c();
p();
d();
m();
var Rr = Symbol(), _n = new WeakMap, Le = class {
    constructor(t) { t === Rr ? _n.set(this, `Prisma.${this._getName()}`) : _n.set(this, `new Prisma.${this._getNamespace()}.${this._getName()}()`); }
    _getName() { return this.constructor.name; }
    toString() { return _n.get(this); }
}, Vt = class extends Le {
    _getNamespace() { return "NullTypes"; }
}, Qt = (_b = class extends Vt {
        constructor() {
            super(...arguments);
            _Qt_e.set(this, void 0);
        }
    },
    _Qt_e = new WeakMap(),
    _b);
Ln(Qt, "DbNull");
var Gt = (_d = class extends Vt {
        constructor() {
            super(...arguments);
            _Gt_e.set(this, void 0);
        }
    },
    _Gt_e = new WeakMap(),
    _d);
Ln(Gt, "JsonNull");
var Jt = (_f = class extends Vt {
        constructor() {
            super(...arguments);
            _Jt_e.set(this, void 0);
        }
    },
    _Jt_e = new WeakMap(),
    _f);
Ln(Jt, "AnyNull");
var kr = { classes: { DbNull: Qt, JsonNull: Gt, AnyNull: Jt }, instances: { DbNull: new Qt(Rr), JsonNull: new Gt(Rr), AnyNull: new Jt(Rr) } };
function Ln(e, t) { Object.defineProperty(e, "name", { value: t, configurable: !0 }); }
f();
c();
p();
d();
m();
var No = ": ", Or = class {
    constructor(t, r) {
        this.hasError = !1;
        this.name = t;
        this.value = r;
    }
    markAsError() { this.hasError = !0; }
    getPrintWidth() { return this.name.length + this.value.getPrintWidth() + No.length; }
    write(t) { let r = new Pe(this.name); this.hasError && r.underline().setColor(t.context.colors.red), t.write(r).write(No).write(this.value); }
};
var Dn = class {
    constructor(t) {
        this.errorMessages = [];
        this.arguments = t;
    }
    write(t) { t.write(this.arguments); }
    addErrorMessage(t) { this.errorMessages.push(t); }
    renderAllMessages(t) {
        return this.errorMessages.map(r => r(t)).join(`
`);
    }
};
function wt(e) { return new Dn(qo(e)); }
function qo(e) { let t = new gt; for (let [r, n] of Object.entries(e)) {
    let i = new Or(r, $o(n));
    t.addField(i);
} return t; }
function $o(e) { if (typeof e == "string")
    return new z(JSON.stringify(e)); if (typeof e == "number" || typeof e == "boolean")
    return new z(String(e)); if (typeof e == "bigint")
    return new z(`${e}n`); if (e === null)
    return new z("null"); if (e === void 0)
    return new z("undefined"); if (ct(e))
    return new z(`new Prisma.Decimal("${e.toFixed()}")`); if (e instanceof Uint8Array)
    return w.Buffer.isBuffer(e) ? new z(`Buffer.alloc(${e.byteLength})`) : new z(`new Uint8Array(${e.byteLength})`); if (e instanceof Date) {
    let t = br(e) ? e.toISOString() : "Invalid Date";
    return new z(`new Date("${t}")`);
} return e instanceof Le ? new z(`Prisma.${e._getName()}`) : yt(e) ? new z(`prisma.${je(e.modelName)}.$fields.${e.name}`) : Array.isArray(e) ? _c(e) : typeof e == "object" ? qo(e) : new z(Object.prototype.toString.call(e)); }
function _c(e) { let t = new ft; for (let r of e)
    t.addItem($o(r)); return t; }
function Ir(e, t) { let r = t === "pretty" ? Oo : Ar, n = e.renderAllMessages(r), i = new dt(0, { colors: r }).write(e).toString(); return { message: n, args: i }; }
function Fr({ args: e, errors: t, errorFormat: r, callsite: n, originalMethod: i, clientVersion: o, globalOmit: s }) { let a = wt(e); for (let h of t)
    vr(h, a, s); let { message: l, args: u } = Ir(a, r), g = Pr({ message: l, callsite: n, originalMethod: i, showColors: r === "pretty", callArguments: u }); throw new te(g, { clientVersion: o }); }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
function ve(e) { return e.replace(/^./, t => t.toLowerCase()); }
f();
c();
p();
d();
m();
function jo(e, t, r) { let n = ve(r); return !t.result || !(t.result.$allModels || t.result[n]) ? e : Lc({ ...e, ...Bo(t.name, e, t.result.$allModels), ...Bo(t.name, e, t.result[n]) }); }
function Lc(e) { let t = new xe, r = (n, i) => t.getOrCreate(n, () => i.has(n) ? [n] : (i.add(n), e[n] ? e[n].needs.flatMap(o => r(o, i)) : [n])); return ot(e, n => ({ ...n, needs: r(n.name, new Set) })); }
function Bo(e, t, r) { return r ? ot(r, ({ needs: n, compute: i }, o) => ({ name: o, needs: n ? Object.keys(n).filter(s => n[s]) : [], compute: Dc(t, o, i) })) : {}; }
function Dc(e, t, r) { let n = e?.[t]?.compute; return n ? i => r({ ...i, [t]: n(i) }) : r; }
function Uo(e, t) { if (!t)
    return e; let r = { ...e }; for (let n of Object.values(t))
    if (e[n.name])
        for (let i of n.needs)
            r[i] = !0; return r; }
function Vo(e, t) { if (!t)
    return e; let r = { ...e }; for (let n of Object.values(t))
    if (!e[n.name])
        for (let i of n.needs)
            delete r[i]; return r; }
var Mr = class {
    constructor(t, r) {
        this.computedFieldsCache = new xe;
        this.modelExtensionsCache = new xe;
        this.queryCallbacksCache = new xe;
        this.clientExtensions = qt(() => this.extension.client ? { ...this.previous?.getAllClientExtensions(), ...this.extension.client } : this.previous?.getAllClientExtensions());
        this.batchCallbacks = qt(() => { let t = this.previous?.getAllBatchQueryCallbacks() ?? [], r = this.extension.query?.$__internalBatch; return r ? t.concat(r) : t; });
        this.extension = t;
        this.previous = r;
    }
    getAllComputedFields(t) { return this.computedFieldsCache.getOrCreate(t, () => jo(this.previous?.getAllComputedFields(t), this.extension, t)); }
    getAllClientExtensions() { return this.clientExtensions.get(); }
    getAllModelExtensions(t) { return this.modelExtensionsCache.getOrCreate(t, () => { let r = ve(t); return !this.extension.model || !(this.extension.model[r] || this.extension.model.$allModels) ? this.previous?.getAllModelExtensions(t) : { ...this.previous?.getAllModelExtensions(t), ...this.extension.model.$allModels, ...this.extension.model[r] }; }); }
    getAllQueryCallbacks(t, r) { return this.queryCallbacksCache.getOrCreate(`${t}:${r}`, () => { let n = this.previous?.getAllQueryCallbacks(t, r) ?? [], i = [], o = this.extension.query; return !o || !(o[t] || o.$allModels || o[r] || o.$allOperations) ? n : (o[t] !== void 0 && (o[t][r] !== void 0 && i.push(o[t][r]), o[t].$allOperations !== void 0 && i.push(o[t].$allOperations)), t !== "$none" && o.$allModels !== void 0 && (o.$allModels[r] !== void 0 && i.push(o.$allModels[r]), o.$allModels.$allOperations !== void 0 && i.push(o.$allModels.$allOperations)), o[r] !== void 0 && i.push(o[r]), o.$allOperations !== void 0 && i.push(o.$allOperations), n.concat(i)); }); }
    getAllBatchQueryCallbacks() { return this.batchCallbacks.get(); }
}, bt = class e {
    constructor(t) { this.head = t; }
    static empty() { return new e; }
    static single(t) { return new e(new Mr(t)); }
    isEmpty() { return this.head === void 0; }
    append(t) { return new e(new Mr(t, this.head)); }
    getAllComputedFields(t) { return this.head?.getAllComputedFields(t); }
    getAllClientExtensions() { return this.head?.getAllClientExtensions(); }
    getAllModelExtensions(t) { return this.head?.getAllModelExtensions(t); }
    getAllQueryCallbacks(t, r) { return this.head?.getAllQueryCallbacks(t, r) ?? []; }
    getAllBatchQueryCallbacks() { return this.head?.getAllBatchQueryCallbacks() ?? []; }
};
f();
c();
p();
d();
m();
var _r = class {
    constructor(t) { this.name = t; }
};
function Qo(e) { return e instanceof _r; }
function Go(e) { return new _r(e); }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var Jo = Symbol(), Wt = class {
    constructor(t) { if (t !== Jo)
        throw new Error("Skip instance can not be constructed directly"); }
    ifUndefined(t) { return t === void 0 ? Lr : t; }
}, Lr = new Wt(Jo);
function Te(e) { return e instanceof Wt; }
var Nc = { findUnique: "findUnique", findUniqueOrThrow: "findUniqueOrThrow", findFirst: "findFirst", findFirstOrThrow: "findFirstOrThrow", findMany: "findMany", count: "aggregate", create: "createOne", createMany: "createMany", createManyAndReturn: "createManyAndReturn", update: "updateOne", updateMany: "updateMany", updateManyAndReturn: "updateManyAndReturn", upsert: "upsertOne", delete: "deleteOne", deleteMany: "deleteMany", executeRaw: "executeRaw", queryRaw: "queryRaw", aggregate: "aggregate", groupBy: "groupBy", runCommandRaw: "runCommandRaw", findRaw: "findRaw", aggregateRaw: "aggregateRaw" }, Wo = "explicitly `undefined` values are not allowed";
function Dr({ modelName: e, action: t, args: r, runtimeDataModel: n, extensions: i = bt.empty(), callsite: o, clientMethod: s, errorFormat: a, clientVersion: l, previewFeatures: u, globalOmit: g }) { let h = new Nn({ runtimeDataModel: n, modelName: e, action: t, rootArgs: r, callsite: o, extensions: i, selectionPath: [], argumentPath: [], originalMethod: s, errorFormat: a, clientVersion: l, previewFeatures: u, globalOmit: g }); return { modelName: e, action: Nc[t], query: Kt(r, h) }; }
function Kt({ select: e, include: t, ...r } = {}, n) { let i = r.omit; return delete r.omit, { arguments: Ho(r, n), selection: qc(e, t, i, n) }; }
function qc(e, t, r, n) { return e ? (t ? n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "include", secondField: "select", selectionPath: n.getSelectionPath() }) : r && n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "omit", secondField: "select", selectionPath: n.getSelectionPath() }), Uc(e, n)) : $c(n, t, r); }
function $c(e, t, r) { let n = {}; return e.modelOrType && !e.isRawAction() && (n.$composites = !0, n.$scalars = !0), t && Bc(n, t, e), jc(n, r, e), n; }
function Bc(e, t, r) { for (let [n, i] of Object.entries(t)) {
    if (Te(i))
        continue;
    let o = r.nestSelection(n);
    if (qn(i, o), i === !1 || i === void 0) {
        e[n] = !1;
        continue;
    }
    let s = r.findField(n);
    if (s && s.kind !== "object" && r.throwValidationError({ kind: "IncludeOnScalar", selectionPath: r.getSelectionPath().concat(n), outputType: r.getOutputTypeDescription() }), s) {
        e[n] = Kt(i === !0 ? {} : i, o);
        continue;
    }
    if (i === !0) {
        e[n] = !0;
        continue;
    }
    e[n] = Kt(i, o);
} }
function jc(e, t, r) { let n = r.getComputedFields(), i = { ...r.getGlobalOmit(), ...t }, o = Vo(i, n); for (let [s, a] of Object.entries(o)) {
    if (Te(a))
        continue;
    qn(a, r.nestSelection(s));
    let l = r.findField(s);
    n?.[s] && !l || (e[s] = !a);
} }
function Uc(e, t) { let r = {}, n = t.getComputedFields(), i = Uo(e, n); for (let [o, s] of Object.entries(i)) {
    if (Te(s))
        continue;
    let a = t.nestSelection(o);
    qn(s, a);
    let l = t.findField(o);
    if (!(n?.[o] && !l)) {
        if (s === !1 || s === void 0 || Te(s)) {
            r[o] = !1;
            continue;
        }
        if (s === !0) {
            l?.kind === "object" ? r[o] = Kt({}, a) : r[o] = !0;
            continue;
        }
        r[o] = Kt(s, a);
    }
} return r; }
function Ko(e, t) { if (e === null)
    return null; if (typeof e == "string" || typeof e == "number" || typeof e == "boolean")
    return e; if (typeof e == "bigint")
    return { $type: "BigInt", value: String(e) }; if (ut(e)) {
    if (br(e))
        return { $type: "DateTime", value: e.toISOString() };
    t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: t.getSelectionPath(), argumentPath: t.getArgumentPath(), argument: { name: t.getArgumentName(), typeNames: ["Date"] }, underlyingError: "Provided Date object is invalid" });
} if (Qo(e))
    return { $type: "Param", value: e.name }; if (yt(e))
    return { $type: "FieldRef", value: { _ref: e.name, _container: e.modelName } }; if (Array.isArray(e))
    return Vc(e, t); if (ArrayBuffer.isView(e)) {
    let { buffer: r, byteOffset: n, byteLength: i } = e;
    return { $type: "Bytes", value: w.Buffer.from(r, n, i).toString("base64") };
} if (Qc(e))
    return e.values; if (ct(e))
    return { $type: "Decimal", value: e.toFixed() }; if (e instanceof Le) {
    if (e !== kr.instances[e._getName()])
        throw new Error("Invalid ObjectEnumValue");
    return { $type: "Enum", value: e._getName() };
} if (Gc(e))
    return e.toJSON(); if (typeof e == "object")
    return Ho(e, t); t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: t.getSelectionPath(), argumentPath: t.getArgumentPath(), argument: { name: t.getArgumentName(), typeNames: [] }, underlyingError: `We could not serialize ${Object.prototype.toString.call(e)} value. Serialize the object to JSON or implement a ".toJSON()" method on it` }); }
function Ho(e, t) { if (e.$type)
    return { $type: "Raw", value: e }; let r = {}; for (let n in e) {
    let i = e[n], o = t.nestArgument(n);
    Te(i) || (i !== void 0 ? r[n] = Ko(i, o) : t.isPreviewFeatureOn("strictUndefinedChecks") && t.throwValidationError({ kind: "InvalidArgumentValue", argumentPath: o.getArgumentPath(), selectionPath: t.getSelectionPath(), argument: { name: t.getArgumentName(), typeNames: [] }, underlyingError: Wo }));
} return r; }
function Vc(e, t) { let r = []; for (let n = 0; n < e.length; n++) {
    let i = t.nestArgument(String(n)), o = e[n];
    if (o === void 0 || Te(o)) {
        let s = o === void 0 ? "undefined" : "Prisma.skip";
        t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: i.getSelectionPath(), argumentPath: i.getArgumentPath(), argument: { name: `${t.getArgumentName()}[${n}]`, typeNames: [] }, underlyingError: `Can not use \`${s}\` value within array. Use \`null\` or filter out \`${s}\` values` });
    }
    r.push(Ko(o, i));
} return r; }
function Qc(e) { return typeof e == "object" && e !== null && e.__prismaRawParameters__ === !0; }
function Gc(e) { return typeof e == "object" && e !== null && typeof e.toJSON == "function"; }
function qn(e, t) { e === void 0 && t.isPreviewFeatureOn("strictUndefinedChecks") && t.throwValidationError({ kind: "InvalidSelectionValue", selectionPath: t.getSelectionPath(), underlyingError: Wo }); }
var Nn = class e {
    constructor(t) { this.params = t; this.params.modelName && (this.modelOrType = this.params.runtimeDataModel.models[this.params.modelName] ?? this.params.runtimeDataModel.types[this.params.modelName]); }
    throwValidationError(t) { Fr({ errors: [t], originalMethod: this.params.originalMethod, args: this.params.rootArgs ?? {}, callsite: this.params.callsite, errorFormat: this.params.errorFormat, clientVersion: this.params.clientVersion, globalOmit: this.params.globalOmit }); }
    getSelectionPath() { return this.params.selectionPath; }
    getArgumentPath() { return this.params.argumentPath; }
    getArgumentName() { return this.params.argumentPath[this.params.argumentPath.length - 1]; }
    getOutputTypeDescription() { if (!(!this.params.modelName || !this.modelOrType))
        return { name: this.params.modelName, fields: this.modelOrType.fields.map(t => ({ name: t.name, typeName: "boolean", isRelation: t.kind === "object" })) }; }
    isRawAction() { return ["executeRaw", "queryRaw", "runCommandRaw", "findRaw", "aggregateRaw"].includes(this.params.action); }
    isPreviewFeatureOn(t) { return this.params.previewFeatures.includes(t); }
    getComputedFields() { if (this.params.modelName)
        return this.params.extensions.getAllComputedFields(this.params.modelName); }
    findField(t) { return this.modelOrType?.fields.find(r => r.name === t); }
    nestSelection(t) { let r = this.findField(t), n = r?.kind === "object" ? r.type : void 0; return new e({ ...this.params, modelName: n, selectionPath: this.params.selectionPath.concat(t) }); }
    getGlobalOmit() { return this.params.modelName && this.shouldApplyGlobalOmit() ? this.params.globalOmit?.[je(this.params.modelName)] ?? {} : {}; }
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
        default: Me(this.params.action, "Unknown action");
    } }
    nestArgument(t) { return new e({ ...this.params, argumentPath: this.params.argumentPath.concat(t) }); }
};
f();
c();
p();
d();
m();
function zo(e) { if (!e._hasPreviewFlag("metrics"))
    throw new te("`metrics` preview feature must be enabled in order to access metrics API", { clientVersion: e._clientVersion }); }
var Et = class {
    constructor(t) { this._client = t; }
    prometheus(t) { return zo(this._client), this._client._engine.metrics({ format: "prometheus", ...t }); }
    json(t) { return zo(this._client), this._client._engine.metrics({ format: "json", ...t }); }
};
f();
c();
p();
d();
m();
function Yo(e, t) { let r = qt(() => Jc(t)); Object.defineProperty(e, "dmmf", { get: () => r.get() }); }
function Jc(e) { return { datamodel: { models: $n(e.models), enums: $n(e.enums), types: $n(e.types) } }; }
function $n(e) { return Object.entries(e).map(([t, r]) => ({ name: t, ...r })); }
f();
c();
p();
d();
m();
var Bn = new WeakMap, Nr = "$$PrismaTypedSql", Ht = class {
    constructor(t, r) { Bn.set(this, { sql: t, values: r }), Object.defineProperty(this, Nr, { value: Nr }); }
    get sql() { return Bn.get(this).sql; }
    get values() { return Bn.get(this).values; }
};
function Zo(e) { return (...t) => new Ht(e, t); }
function qr(e) { return e != null && e[Nr] === Nr; }
f();
c();
p();
d();
m();
var ha = Re(Xo());
f();
c();
p();
d();
m();
es();
mn();
gn();
f();
c();
p();
d();
m();
var le = class e {
    constructor(t, r) { if (t.length - 1 !== r.length)
        throw t.length === 0 ? new TypeError("Expected at least 1 string") : new TypeError(`Expected ${t.length} strings to have ${t.length - 1} values`); let n = r.reduce((s, a) => s + (a instanceof e ? a.values.length : 1), 0); this.values = new Array(n), this.strings = new Array(n + 1), this.strings[0] = t[0]; let i = 0, o = 0; for (; i < r.length;) {
        let s = r[i++], a = t[i];
        if (s instanceof e) {
            this.strings[o] += s.strings[0];
            let l = 0;
            for (; l < s.values.length;)
                this.values[o++] = s.values[l++], this.strings[o] = s.strings[l];
            this.strings[o] += a;
        }
        else
            this.values[o++] = s, this.strings[o] = a;
    } }
    get sql() { let t = this.strings.length, r = 1, n = this.strings[0]; for (; r < t;)
        n += `?${this.strings[r++]}`; return n; }
    get statement() { let t = this.strings.length, r = 1, n = this.strings[0]; for (; r < t;)
        n += `:${r}${this.strings[r++]}`; return n; }
    get text() { let t = this.strings.length, r = 1, n = this.strings[0]; for (; r < t;)
        n += `$${r}${this.strings[r++]}`; return n; }
    inspect() { return { sql: this.sql, statement: this.statement, text: this.text, values: this.values }; }
};
function ts(e, t = ",", r = "", n = "") { if (e.length === 0)
    throw new TypeError("Expected `join([])` to be called with an array of multiple elements, but got an empty array"); return new le([r, ...Array(e.length - 1).fill(t), n], e); }
function jn(e) { return new le([e], []); }
var rs = jn("");
function Un(e, ...t) { return new le(e, t); }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
function zt(e) { return { getKeys() { return Object.keys(e); }, getPropertyValue(t) { return e[t]; } }; }
f();
c();
p();
d();
m();
function ne(e, t) { return { getKeys() { return [e]; }, getPropertyValue() { return t(); } }; }
f();
c();
p();
d();
m();
function ze(e) { let t = new xe; return { getKeys() { return e.getKeys(); }, getPropertyValue(r) { return t.getOrCreate(r, () => e.getPropertyValue(r)); }, getPropertyDescriptor(r) { return e.getPropertyDescriptor?.(r); } }; }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var Br = { enumerable: !0, configurable: !0, writable: !0 };
function jr(e) { let t = new Set(e); return { getPrototypeOf: () => Object.prototype, getOwnPropertyDescriptor: () => Br, has: (r, n) => t.has(n), set: (r, n, i) => t.add(n) && Reflect.set(r, n, i), ownKeys: () => [...t] }; }
var ns = Symbol.for("nodejs.util.inspect.custom");
function ge(e, t) { let r = Kc(t), n = new Set, i = new Proxy(e, { get(o, s) { if (n.has(s))
        return o[s]; let a = r.get(s); return a ? a.getPropertyValue(s) : o[s]; }, has(o, s) { if (n.has(s))
        return !0; let a = r.get(s); return a ? a.has?.(s) ?? !0 : Reflect.has(o, s); }, ownKeys(o) { let s = is(Reflect.ownKeys(o), r), a = is(Array.from(r.keys()), r); return [...new Set([...s, ...a, ...n])]; }, set(o, s, a) { return r.get(s)?.getPropertyDescriptor?.(s)?.writable === !1 ? !1 : (n.add(s), Reflect.set(o, s, a)); }, getOwnPropertyDescriptor(o, s) { let a = Reflect.getOwnPropertyDescriptor(o, s); if (a && !a.configurable)
        return a; let l = r.get(s); return l ? l.getPropertyDescriptor ? { ...Br, ...l?.getPropertyDescriptor(s) } : Br : a; }, defineProperty(o, s, a) { return n.add(s), Reflect.defineProperty(o, s, a); }, getPrototypeOf: () => Object.prototype }); return i[ns] = function () { let o = { ...this }; return delete o[ns], o; }, i; }
function Kc(e) { let t = new Map; for (let r of e) {
    let n = r.getKeys();
    for (let i of n)
        t.set(i, r);
} return t; }
function is(e, t) { return e.filter(r => t.get(r)?.has?.(r) ?? !0); }
f();
c();
p();
d();
m();
function xt(e) { return { getKeys() { return e; }, has() { return !1; }, getPropertyValue() { } }; }
f();
c();
p();
d();
m();
function Ur(e, t) { return { batch: e, transaction: t?.kind === "batch" ? { isolationLevel: t.options.isolationLevel } : void 0 }; }
f();
c();
p();
d();
m();
function os(e) { if (e === void 0)
    return ""; let t = wt(e); return new dt(0, { colors: Ar }).write(t).toString(); }
f();
c();
p();
d();
m();
var Hc = "P2037";
function Vr({ error: e, user_facing_error: t }, r, n) { return t.error_code ? new se(zc(t, n), { code: t.error_code, clientVersion: r, meta: t.meta, batchRequestIdx: t.batch_request_idx }) : new J(e, { clientVersion: r, batchRequestIdx: t.batch_request_idx }); }
function zc(e, t) {
    let r = e.message;
    return (t === "postgresql" || t === "postgres" || t === "mysql") && e.error_code === Hc && (r += `
Prisma Accelerate has built-in connection pooling to prevent such errors: https://pris.ly/client/error-accelerate`), r;
}
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var Yt = "<unknown>";
function ss(e) {
    var t = e.split(`
`);
    return t.reduce(function (r, n) { var i = Xc(n) || tp(n) || ip(n) || lp(n) || sp(n); return i && r.push(i), r; }, []);
}
var Yc = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|rsc|<anonymous>|\/|[a-z]:\\|\\\\).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i, Zc = /\((\S*)(?::(\d+))(?::(\d+))\)/;
function Xc(e) { var t = Yc.exec(e); if (!t)
    return null; var r = t[2] && t[2].indexOf("native") === 0, n = t[2] && t[2].indexOf("eval") === 0, i = Zc.exec(t[2]); return n && i != null && (t[2] = i[1], t[3] = i[2], t[4] = i[3]), { file: r ? null : t[2], methodName: t[1] || Yt, arguments: r ? [t[2]] : [], lineNumber: t[3] ? +t[3] : null, column: t[4] ? +t[4] : null }; }
var ep = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|rsc|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
function tp(e) { var t = ep.exec(e); return t ? { file: t[2], methodName: t[1] || Yt, arguments: [], lineNumber: +t[3], column: t[4] ? +t[4] : null } : null; }
var rp = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|rsc|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i, np = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
function ip(e) { var t = rp.exec(e); if (!t)
    return null; var r = t[3] && t[3].indexOf(" > eval") > -1, n = np.exec(t[3]); return r && n != null && (t[3] = n[1], t[4] = n[2], t[5] = null), { file: t[3], methodName: t[1] || Yt, arguments: t[2] ? t[2].split(",") : [], lineNumber: t[4] ? +t[4] : null, column: t[5] ? +t[5] : null }; }
var op = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i;
function sp(e) { var t = op.exec(e); return t ? { file: t[3], methodName: t[1] || Yt, arguments: [], lineNumber: +t[4], column: t[5] ? +t[5] : null } : null; }
var ap = /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;
function lp(e) { var t = ap.exec(e); return t ? { file: t[2], methodName: t[1] || Yt, arguments: [], lineNumber: +t[3], column: t[4] ? +t[4] : null } : null; }
var Vn = class {
    getLocation() { return null; }
}, Qn = class {
    constructor() { this._error = new Error; }
    getLocation() { let t = this._error.stack; if (!t)
        return null; let n = ss(t).find(i => { if (!i.file)
        return !1; let o = vn(i.file); return o !== "<anonymous>" && !o.includes("@prisma") && !o.includes("/packages/client/src/runtime/") && !o.endsWith("/runtime/binary.js") && !o.endsWith("/runtime/library.js") && !o.endsWith("/runtime/edge.js") && !o.endsWith("/runtime/edge-esm.js") && !o.startsWith("internal/") && !i.methodName.includes("new ") && !i.methodName.includes("getCallSite") && !i.methodName.includes("Proxy.") && i.methodName.split(".").length < 4; }); return !n || !n.file ? null : { fileName: n.file, lineNumber: n.lineNumber, columnNumber: n.column }; }
};
function Ve(e) { return e === "minimal" ? typeof $EnabledCallSite == "function" && e !== "minimal" ? new $EnabledCallSite : new Vn : new Qn; }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var as = { _avg: !0, _count: !0, _sum: !0, _min: !0, _max: !0 };
function Pt(e = {}) { let t = cp(e); return Object.entries(t).reduce((n, [i, o]) => (as[i] !== void 0 ? n.select[i] = { select: o } : n[i] = o, n), { select: {} }); }
function cp(e = {}) { return typeof e._count == "boolean" ? { ...e, _count: { _all: e._count } } : e; }
function Qr(e = {}) { return t => (typeof e._count == "boolean" && (t._count = t._count._all), t); }
function ls(e, t) { let r = Qr(e); return t({ action: "aggregate", unpacker: r, argsMapper: Pt })(e); }
f();
c();
p();
d();
m();
function pp(e = {}) { let { select: t, ...r } = e; return typeof t == "object" ? Pt({ ...r, _count: t }) : Pt({ ...r, _count: { _all: !0 } }); }
function dp(e = {}) { return typeof e.select == "object" ? t => Qr(e)(t)._count : t => Qr(e)(t)._count._all; }
function us(e, t) { return t({ action: "count", unpacker: dp(e), argsMapper: pp })(e); }
f();
c();
p();
d();
m();
function mp(e = {}) { let t = Pt(e); if (Array.isArray(t.by))
    for (let r of t.by)
        typeof r == "string" && (t.select[r] = !0);
else
    typeof t.by == "string" && (t.select[t.by] = !0); return t; }
function fp(e = {}) { return t => (typeof e?._count == "boolean" && t.forEach(r => { r._count = r._count._all; }), t); }
function cs(e, t) { return t({ action: "groupBy", unpacker: fp(e), argsMapper: mp })(e); }
function ps(e, t, r) { if (t === "aggregate")
    return n => ls(n, r); if (t === "count")
    return n => us(n, r); if (t === "groupBy")
    return n => cs(n, r); }
f();
c();
p();
d();
m();
function ds(e, t) { let r = t.fields.filter(i => !i.relationName), n = yo(r, "name"); return new Proxy({}, { get(i, o) { if (o in i || typeof o == "symbol")
        return i[o]; let s = n[o]; if (s)
        return new Ut(e, o, s.type, s.isList, s.kind === "enum"); }, ...jr(Object.keys(n)) }); }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var ms = e => Array.isArray(e) ? e : e.split("."), Gn = (e, t) => ms(t).reduce((r, n) => r && r[n], e), fs = (e, t, r) => ms(t).reduceRight((n, i, o, s) => Object.assign({}, Gn(e, s.slice(0, o)), { [i]: n }), r);
function gp(e, t) { return e === void 0 || t === void 0 ? [] : [...t, "select", e]; }
function hp(e, t, r) { return t === void 0 ? e ?? {} : fs(t, r, e || !0); }
function Jn(e, t, r, n, i, o) { let a = e._runtimeDataModel.models[t].fields.reduce((l, u) => ({ ...l, [u.name]: u }), {}); return l => { let u = Ve(e._errorFormat), g = gp(n, i), h = hp(l, o, g), T = r({ dataPath: g, callsite: u })(h), k = yp(e, t); return new Proxy(T, { get(A, S) { if (!k.includes(S))
        return A[S]; let _ = [a[S].type, r, S], D = [g, h]; return Jn(e, ..._, ...D); }, ...jr([...k, ...Object.getOwnPropertyNames(T)]) }); }; }
function yp(e, t) { return e._runtimeDataModel.models[t].fields.filter(r => r.kind === "object").map(r => r.name); }
var wp = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "create", "update", "upsert", "delete"], bp = ["aggregate", "count", "groupBy"];
function Wn(e, t) { let r = e._extensions.getAllModelExtensions(t) ?? {}, n = [Ep(e, t), Pp(e, t), zt(r), ne("name", () => t), ne("$name", () => t), ne("$parent", () => e._appliedParent)]; return ge({}, n); }
function Ep(e, t) { let r = ve(t), n = Object.keys(pt).concat("count"); return { getKeys() { return n; }, getPropertyValue(i) { let o = i, s = a => l => { let u = Ve(e._errorFormat); return e._createPrismaPromise(g => { let h = { args: l, dataPath: [], action: o, model: t, clientMethod: `${r}.${i}`, jsModelName: r, transaction: g, callsite: u }; return e._request({ ...h, ...a }); }, { action: o, args: l, model: t }); }; return wp.includes(o) ? Jn(e, t, s) : xp(i) ? ps(e, i, s) : s({}); } }; }
function xp(e) { return bp.includes(e); }
function Pp(e, t) { return ze(ne("fields", () => { let r = e._runtimeDataModel.models[t]; return ds(t, r); })); }
f();
c();
p();
d();
m();
function gs(e) { return e.replace(/^./, t => t.toUpperCase()); }
var Kn = Symbol();
function Zt(e) { let t = [vp(e), Tp(e), ne(Kn, () => e), ne("$parent", () => e._appliedParent)], r = e._extensions.getAllClientExtensions(); return r && t.push(zt(r)), ge(e, t); }
function vp(e) { let t = Object.getPrototypeOf(e._originalClient), r = [...new Set(Object.getOwnPropertyNames(t))]; return { getKeys() { return r; }, getPropertyValue(n) { return e[n]; } }; }
function Tp(e) { let t = Object.keys(e._runtimeDataModel.models), r = t.map(ve), n = [...new Set(t.concat(r))]; return ze({ getKeys() { return n; }, getPropertyValue(i) { let o = gs(i); if (e._runtimeDataModel.models[o] !== void 0)
        return Wn(e, o); if (e._runtimeDataModel.models[i] !== void 0)
        return Wn(e, i); }, getPropertyDescriptor(i) { if (!r.includes(i))
        return { enumerable: !1 }; } }); }
function hs(e) { return e[Kn] ? e[Kn] : e; }
function ys(e) { if (typeof e == "function")
    return e(this); if (e.client?.__AccelerateEngine) {
    let r = e.client.__AccelerateEngine;
    this._originalClient._engine = new r(this._originalClient._accelerateEngineConfig);
} let t = Object.create(this._originalClient, { _extensions: { value: this._extensions.append(e) }, _appliedParent: { value: this, configurable: !0 }, $use: { value: void 0 }, $on: { value: void 0 } }); return Zt(t); }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
function ws({ result: e, modelName: t, select: r, omit: n, extensions: i }) { let o = i.getAllComputedFields(t); if (!o)
    return e; let s = [], a = []; for (let l of Object.values(o)) {
    if (n) {
        if (n[l.name])
            continue;
        let u = l.needs.filter(g => n[g]);
        u.length > 0 && a.push(xt(u));
    }
    else if (r) {
        if (!r[l.name])
            continue;
        let u = l.needs.filter(g => !r[g]);
        u.length > 0 && a.push(xt(u));
    }
    Cp(e, l.needs) && s.push(Ap(l, ge(e, s)));
} return s.length > 0 || a.length > 0 ? ge(e, [...s, ...a]) : e; }
function Cp(e, t) { return t.every(r => Tn(e, r)); }
function Ap(e, t) { return ze(ne(e.name, () => e.compute(t))); }
f();
c();
p();
d();
m();
function Gr({ visitor: e, result: t, args: r, runtimeDataModel: n, modelName: i }) { if (Array.isArray(t)) {
    for (let s = 0; s < t.length; s++)
        t[s] = Gr({ result: t[s], args: r, modelName: i, runtimeDataModel: n, visitor: e });
    return t;
} let o = e(t, i, r) ?? t; return r.include && bs({ includeOrSelect: r.include, result: o, parentModelName: i, runtimeDataModel: n, visitor: e }), r.select && bs({ includeOrSelect: r.select, result: o, parentModelName: i, runtimeDataModel: n, visitor: e }), o; }
function bs({ includeOrSelect: e, result: t, parentModelName: r, runtimeDataModel: n, visitor: i }) { for (let [o, s] of Object.entries(e)) {
    if (!s || t[o] == null || Te(s))
        continue;
    let l = n.models[r].fields.find(g => g.name === o);
    if (!l || l.kind !== "object" || !l.relationName)
        continue;
    let u = typeof s == "object" ? s : {};
    t[o] = Gr({ visitor: i, result: t[o], args: u, modelName: l.type, runtimeDataModel: n });
} }
function Es({ result: e, modelName: t, args: r, extensions: n, runtimeDataModel: i, globalOmit: o }) { return n.isEmpty() || e == null || typeof e != "object" || !i.models[t] ? e : Gr({ result: e, args: r ?? {}, modelName: t, runtimeDataModel: i, visitor: (a, l, u) => { let g = ve(l); return ws({ result: a, modelName: g, select: u.select, omit: u.select ? void 0 : { ...o?.[g], ...u.omit }, extensions: n }); } }); }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var Sp = ["$connect", "$disconnect", "$on", "$transaction", "$use", "$extends"], xs = Sp;
function Ps(e) { if (e instanceof le)
    return Rp(e); if (qr(e))
    return kp(e); if (Array.isArray(e)) {
    let r = [e[0]];
    for (let n = 1; n < e.length; n++)
        r[n] = Xt(e[n]);
    return r;
} let t = {}; for (let r in e)
    t[r] = Xt(e[r]); return t; }
function Rp(e) { return new le(e.strings, e.values); }
function kp(e) { return new Ht(e.sql, e.values); }
function Xt(e) { if (typeof e != "object" || e == null || e instanceof Le || yt(e))
    return e; if (ct(e))
    return new Ee(e.toFixed()); if (ut(e))
    return new Date(+e); if (ArrayBuffer.isView(e))
    return e.slice(0); if (Array.isArray(e)) {
    let t = e.length, r;
    for (r = Array(t); t--;)
        r[t] = Xt(e[t]);
    return r;
} if (typeof e == "object") {
    let t = {};
    for (let r in e)
        r === "__proto__" ? Object.defineProperty(t, r, { value: Xt(e[r]), configurable: !0, enumerable: !0, writable: !0 }) : t[r] = Xt(e[r]);
    return t;
} Me(e, "Unknown value"); }
function Ts(e, t, r, n = 0) { return e._createPrismaPromise(i => { let o = t.customDataProxyFetch; return "transaction" in t && i !== void 0 && (t.transaction?.kind === "batch" && t.transaction.lock.then(), t.transaction = i), n === r.length ? e._executeRequest(t) : r[n]({ model: t.model, operation: t.model ? t.action : t.clientMethod, args: Ps(t.args ?? {}), __internalParams: t, query: (s, a = t) => { let l = a.customDataProxyFetch; return a.customDataProxyFetch = Rs(o, l), a.args = s, Ts(e, a, r, n + 1); } }); }); }
function Cs(e, t) { let { jsModelName: r, action: n, clientMethod: i } = t, o = r ? n : i; if (e._extensions.isEmpty())
    return e._executeRequest(t); let s = e._extensions.getAllQueryCallbacks(r ?? "$none", o); return Ts(e, t, s); }
function As(e) { return t => { let r = { requests: t }, n = t[0].extensions.getAllBatchQueryCallbacks(); return n.length ? Ss(r, n, 0, e) : e(r); }; }
function Ss(e, t, r, n) { if (r === t.length)
    return n(e); let i = e.customDataProxyFetch, o = e.requests[0].transaction; return t[r]({ args: { queries: e.requests.map(s => ({ model: s.modelName, operation: s.action, args: s.args })), transaction: o ? { isolationLevel: o.kind === "batch" ? o.isolationLevel : void 0 } : void 0 }, __internalParams: e, query(s, a = e) { let l = a.customDataProxyFetch; return a.customDataProxyFetch = Rs(i, l), Ss(a, t, r + 1, n); } }); }
var vs = e => e;
function Rs(e = vs, t = vs) { return r => e(t(r)); }
f();
c();
p();
d();
m();
var ks = H("prisma:client"), Os = { Vercel: "vercel", "Netlify CI": "netlify" };
function Is({ postinstall: e, ciName: t, clientVersion: r }) {
    if (ks("checkPlatformCaching:postinstall", e), ks("checkPlatformCaching:ciName", t), e === !0 && t && t in Os) {
        let n = `Prisma has detected that this project was built on ${t}, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered. To fix this, make sure to run the \`prisma generate\` command during the build process.

Learn how: https://pris.ly/d/${Os[t]}-build`;
        throw console.error(n), new Q(n, r);
    }
}
f();
c();
p();
d();
m();
function Fs(e, t) { return e ? e.datasources ? e.datasources : e.datasourceUrl ? { [t[0]]: { url: e.datasourceUrl } } : {} : {}; }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var Op = () => globalThis.process?.release?.name === "node", Ip = () => !!globalThis.Bun || !!globalThis.process?.versions?.bun, Fp = () => !!globalThis.Deno, Mp = () => typeof globalThis.Netlify == "object", _p = () => typeof globalThis.EdgeRuntime == "object", Lp = () => globalThis.navigator?.userAgent === "Cloudflare-Workers";
function Dp() { return [[Mp, "netlify"], [_p, "edge-light"], [Lp, "workerd"], [Fp, "deno"], [Ip, "bun"], [Op, "node"]].flatMap(r => r[0]() ? [r[1]] : []).at(0) ?? ""; }
var Np = { node: "Node.js", workerd: "Cloudflare Workers", deno: "Deno and Deno Deploy", netlify: "Netlify Edge Functions", "edge-light": "Edge Runtime (Vercel Edge Functions, Vercel Edge Middleware, Next.js (Pages Router) Edge API Routes, Next.js (App Router) Edge Route Handlers or Next.js Middleware)" };
function Ms() { let e = Dp(); return { id: e, prettyName: Np[e] || e, isEdge: ["workerd", "deno", "netlify", "edge-light"].includes(e) }; }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var Hn = Re(Pn());
f();
c();
p();
d();
m();
function _s(e) { return e ? e.replace(/".*"/g, '"X"').replace(/[\s:\[]([+-]?([0-9]*[.])?[0-9]+)/g, t => `${t[0]}5`) : ""; }
f();
c();
p();
d();
m();
function Ls(e) {
    return e.split(`
`).map(t => t.replace(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)\s*/, "").replace(/\+\d+\s*ms$/, "")).join(`
`);
}
f();
c();
p();
d();
m();
var Ds = Re(Xi());
function Ns({ title: e, user: t = "prisma", repo: r = "prisma", template: n = "bug_report.yml", body: i }) { return (0, Ds.default)({ user: t, repo: r, template: n, title: e, body: i }); }
function qs({ version: e, binaryTarget: t, title: r, description: n, engineVersion: i, database: o, query: s }) {
    let a = Li(6e3 - (s?.length ?? 0)), l = Ls((0, Hn.default)(a)), u = n ? `# Description
\`\`\`
${n}
\`\`\`` : "", g = (0, Hn.default)(`Hi Prisma Team! My Prisma Client just crashed. This is the report:
## Versions

| Name            | Version            |
|-----------------|--------------------|
| Node            | ${y.version?.padEnd(19)}| 
| OS              | ${t?.padEnd(19)}|
| Prisma Client   | ${e?.padEnd(19)}|
| Query Engine    | ${i?.padEnd(19)}|
| Database        | ${o?.padEnd(19)}|

${u}

## Logs
\`\`\`
${l}
\`\`\`

## Client Snippet
\`\`\`ts
// PLEASE FILL YOUR CODE SNIPPET HERE
\`\`\`

## Schema
\`\`\`prisma
// PLEASE ADD YOUR SCHEMA HERE IF POSSIBLE
\`\`\`

## Prisma Engine Query
\`\`\`
${s ? _s(s) : ""}
\`\`\`
`), h = Ns({ title: r, body: g });
    return `${r}

This is a non-recoverable error which probably happens when the Prisma Query Engine has a panic.

${Rt(h)}

If you want the Prisma team to look into it, please open the link above \u{1F64F}
To increase the chance of success, please post your schema and a snippet of
how you used Prisma Client in the issue. 
`;
}
var $s = "6.13.0";
f();
c();
p();
d();
m();
function Jr({ inlineDatasources: e, overrideDatasources: t, env: r, clientVersion: n }) { let i, o = Object.keys(e)[0], s = e[o]?.url, a = t[o]?.url; if (o === void 0 ? i = void 0 : a ? i = a : s?.value ? i = s.value : s?.fromEnvVar && (i = r[s.fromEnvVar]), s?.fromEnvVar !== void 0 && i === void 0)
    throw new Q(`error: Environment variable not found: ${s.fromEnvVar}.`, n); if (i === void 0)
    throw new Q("error: Missing URL environment variable, value, or override.", n); return i; }
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
function Bs(e) { if (e?.kind === "itx")
    return e.options.id; }
f();
c();
p();
d();
m();
var zn = class {
    constructor(t, r, n) { this.engineObject = __PrismaProxy.create({ datamodel: t.datamodel, env: y.env, ignoreEnvVarErrors: !0, datasourceOverrides: t.datasourceOverrides ?? {}, logLevel: t.logLevel, logQueries: t.logQueries ?? !1, logCallback: r, enableTracing: t.enableTracing }); }
    async connect(t, r) { return __PrismaProxy.connect(this.engineObject, t, r); }
    async disconnect(t, r) { return __PrismaProxy.disconnect(this.engineObject, t, r); }
    query(t, r, n, i) { return __PrismaProxy.execute(this.engineObject, t, r, n, i); }
    compile() { throw new Error("not implemented"); }
    sdlSchema() { return Promise.resolve("{}"); }
    dmmf(t) { return Promise.resolve("{}"); }
    async startTransaction(t, r, n) { return __PrismaProxy.startTransaction(this.engineObject, t, r, n); }
    async commitTransaction(t, r, n) { return __PrismaProxy.commitTransaction(this.engineObject, t, r, n); }
    async rollbackTransaction(t, r, n) { return __PrismaProxy.rollbackTransaction(this.engineObject, t, r, n); }
    metrics(t) { return Promise.resolve("{}"); }
    async applyPendingMigrations() { return __PrismaProxy.applyPendingMigrations(this.engineObject); }
    trace(t) { return __PrismaProxy.trace(this.engineObject, t); }
}, js = { async loadLibrary(e) { if (!__PrismaProxy)
        throw new Q("__PrismaProxy not detected make sure React Native bindings are installed", e.clientVersion); return { debugPanic() { return Promise.reject("{}"); }, dmmf() { return Promise.resolve("{}"); }, version() { return { commit: "unknown", version: "unknown" }; }, QueryEngine: zn }; } };
var $p = "P2036", Ce = H("prisma:client:libraryEngine");
function Bp(e) { return e.item_type === "query" && "query" in e; }
function jp(e) { return "level" in e ? e.level === "error" && e.message === "PANIC" : !1; }
var lk = [...fn, "native"], Up = 0xffffffffffffffffn, Yn = 1n;
function Vp() { let e = Yn++; return Yn > Up && (Yn = 1n), e; }
var er = class {
    constructor(t, r) {
        this.name = "LibraryEngine";
        this.libraryLoader = js, this.config = t, this.libraryStarted = !1, this.logQueries = t.logQueries ?? !1, this.logLevel = t.logLevel ?? "error", this.logEmitter = t.logEmitter, this.datamodel = t.inlineSchema, this.tracingHelper = t.tracingHelper, t.enableDebugLogs && (this.logLevel = "debug");
        let n = Object.keys(t.overrideDatasources)[0], i = t.overrideDatasources[n]?.url;
        n !== void 0 && i !== void 0 && (this.datasourceOverrides = { [n]: i }), this.libraryInstantiationPromise = this.instantiateLibrary();
    }
    wrapEngine(t) { return { applyPendingMigrations: t.applyPendingMigrations?.bind(t), commitTransaction: this.withRequestId(t.commitTransaction.bind(t)), connect: this.withRequestId(t.connect.bind(t)), disconnect: this.withRequestId(t.disconnect.bind(t)), metrics: t.metrics?.bind(t), query: this.withRequestId(t.query.bind(t)), rollbackTransaction: this.withRequestId(t.rollbackTransaction.bind(t)), sdlSchema: t.sdlSchema?.bind(t), startTransaction: this.withRequestId(t.startTransaction.bind(t)), trace: t.trace.bind(t), free: t.free?.bind(t) }; }
    withRequestId(t) { return async (...r) => { let n = Vp().toString(); try {
        return await t(...r, n);
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
    async applyPendingMigrations() { await this.start(), await this.engine?.applyPendingMigrations(); }
    async transaction(t, r, n) { await this.start(); let i = await this.adapterPromise, o = JSON.stringify(r), s; if (t === "start") {
        let l = JSON.stringify({ max_wait: n.maxWait, timeout: n.timeout, isolation_level: n.isolationLevel });
        s = await this.engine?.startTransaction(l, o);
    }
    else
        t === "commit" ? s = await this.engine?.commitTransaction(n.id, o) : t === "rollback" && (s = await this.engine?.rollbackTransaction(n.id, o)); let a = this.parseEngineResponse(s); if (Qp(a)) {
        let l = this.getExternalAdapterError(a, i?.errorRegistry);
        throw l ? l.error : new se(a.message, { code: a.error_code, clientVersion: this.config.clientVersion, meta: a.meta });
    }
    else if (typeof a.message == "string")
        throw new J(a.message, { clientVersion: this.config.clientVersion }); return a; }
    async instantiateLibrary() { if (Ce("internalSetup"), this.libraryInstantiationPromise)
        return this.libraryInstantiationPromise; this.binaryTarget = await this.getCurrentBinaryTarget(), await this.tracingHelper.runInChildSpan("load_engine", () => this.loadEngine()), this.version(); }
    async getCurrentBinaryTarget() { }
    parseEngineResponse(t) { if (!t)
        throw new J("Response from the Engine was empty", { clientVersion: this.config.clientVersion }); try {
        return JSON.parse(t);
    }
    catch {
        throw new J("Unable to JSON.parse response from engine", { clientVersion: this.config.clientVersion });
    } }
    async loadEngine() { if (!this.engine) {
        this.QueryEngineConstructor || (this.library = await this.libraryLoader.loadLibrary(this.config), this.QueryEngineConstructor = this.library.QueryEngine);
        try {
            let t = new b(this);
            this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(lr));
            let r = await this.adapterPromise;
            r && Ce("Using driver adapter: %O", r), this.engine = this.wrapEngine(new this.QueryEngineConstructor({ datamodel: this.datamodel, env: y.env, logQueries: this.config.logQueries ?? !1, ignoreEnvVarErrors: !0, datasourceOverrides: this.datasourceOverrides ?? {}, logLevel: this.logLevel, configDir: this.config.cwd, engineProtocol: "json", enableTracing: this.tracingHelper.isEnabled() }, n => { t.deref()?.logger(n); }, r));
        }
        catch (t) {
            let r = t, n = this.parseInitError(r.message);
            throw typeof n == "string" ? r : new Q(n.message, this.config.clientVersion, n.error_code);
        }
    } }
    logger(t) { let r = this.parseEngineResponse(t); r && (r.level = r?.level.toLowerCase() ?? "unknown", Bp(r) ? this.logEmitter.emit("query", { timestamp: new Date, query: r.query, params: r.params, duration: Number(r.duration_ms), target: r.module_path }) : jp(r) ? this.loggerRustPanic = new ce(Zn(this, `${r.message}: ${r.reason} in ${r.file}:${r.line}:${r.column}`), this.config.clientVersion) : this.logEmitter.emit(r.level, { timestamp: new Date, message: r.message, target: r.module_path })); }
    parseInitError(t) { try {
        return JSON.parse(t);
    }
    catch { } return t; }
    parseRequestError(t) { try {
        return JSON.parse(t);
    }
    catch { } return t; }
    onBeforeExit() { throw new Error('"beforeExit" hook is not applicable to the library engine since Prisma 5.0.0, it is only relevant and implemented for the binary engine. Please add your event listener to the `process` object directly instead.'); }
    async start() { if (this.libraryInstantiationPromise || (this.libraryInstantiationPromise = this.instantiateLibrary()), await this.libraryInstantiationPromise, await this.libraryStoppingPromise, this.libraryStartingPromise)
        return Ce(`library already starting, this.libraryStarted: ${this.libraryStarted}`), this.libraryStartingPromise; if (this.libraryStarted)
        return; let t = async () => { Ce("library starting"); try {
        let r = { traceparent: this.tracingHelper.getTraceParent() };
        await this.engine?.connect(JSON.stringify(r)), this.libraryStarted = !0, this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(lr)), await this.adapterPromise, Ce("library started");
    }
    catch (r) {
        let n = this.parseInitError(r.message);
        throw typeof n == "string" ? r : new Q(n.message, this.config.clientVersion, n.error_code);
    }
    finally {
        this.libraryStartingPromise = void 0;
    } }; return this.libraryStartingPromise = this.tracingHelper.runInChildSpan("connect", t), this.libraryStartingPromise; }
    async stop() { if (await this.libraryInstantiationPromise, await this.libraryStartingPromise, await this.executingQueryPromise, this.libraryStoppingPromise)
        return Ce("library is already stopping"), this.libraryStoppingPromise; if (!this.libraryStarted) {
        await (await this.adapterPromise)?.dispose(), this.adapterPromise = void 0;
        return;
    } let t = async () => { await new Promise(n => setImmediate(n)), Ce("library stopping"); let r = { traceparent: this.tracingHelper.getTraceParent() }; await this.engine?.disconnect(JSON.stringify(r)), this.engine?.free && this.engine.free(), this.engine = void 0, this.libraryStarted = !1, this.libraryStoppingPromise = void 0, this.libraryInstantiationPromise = void 0, await (await this.adapterPromise)?.dispose(), this.adapterPromise = void 0, Ce("library stopped"); }; return this.libraryStoppingPromise = this.tracingHelper.runInChildSpan("disconnect", t), this.libraryStoppingPromise; }
    version() { return this.versionInfo = this.library?.version(), this.versionInfo?.version ?? "unknown"; }
    debugPanic(t) { return this.library?.debugPanic(t); }
    async request(t, { traceparent: r, interactiveTransaction: n }) {
        Ce(`sending request, this.libraryStarted: ${this.libraryStarted}`);
        let i = JSON.stringify({ traceparent: r }), o = JSON.stringify(t);
        try {
            await this.start();
            let s = await this.adapterPromise;
            this.executingQueryPromise = this.engine?.query(o, i, n?.id), this.lastQuery = o;
            let a = this.parseEngineResponse(await this.executingQueryPromise);
            if (a.errors)
                throw a.errors.length === 1 ? this.buildQueryError(a.errors[0], s?.errorRegistry) : new J(JSON.stringify(a.errors), { clientVersion: this.config.clientVersion });
            if (this.loggerRustPanic)
                throw this.loggerRustPanic;
            return { data: a };
        }
        catch (s) {
            if (s instanceof Q)
                throw s;
            if (s.code === "GenericFailure" && s.message?.startsWith("PANIC:"))
                throw new ce(Zn(this, s.message), this.config.clientVersion);
            let a = this.parseRequestError(s.message);
            throw typeof a == "string" ? s : new J(`${a.message}
${a.backtrace}`, { clientVersion: this.config.clientVersion });
        }
    }
    async requestBatch(t, { transaction: r, traceparent: n }) { Ce("requestBatch"); let i = Ur(t, r); await this.start(); let o = await this.adapterPromise; this.lastQuery = JSON.stringify(i), this.executingQueryPromise = this.engine?.query(this.lastQuery, JSON.stringify({ traceparent: n }), Bs(r)); let s = await this.executingQueryPromise, a = this.parseEngineResponse(s); if (a.errors)
        throw a.errors.length === 1 ? this.buildQueryError(a.errors[0], o?.errorRegistry) : new J(JSON.stringify(a.errors), { clientVersion: this.config.clientVersion }); let { batchResult: l, errors: u } = a; if (Array.isArray(l))
        return l.map(g => g.errors && g.errors.length > 0 ? this.loggerRustPanic ?? this.buildQueryError(g.errors[0], o?.errorRegistry) : { data: g }); throw u && u.length === 1 ? new Error(u[0].error) : new Error(JSON.stringify(a)); }
    buildQueryError(t, r) { if (t.user_facing_error.is_panic)
        return new ce(Zn(this, t.user_facing_error.message), this.config.clientVersion); let n = this.getExternalAdapterError(t.user_facing_error, r); return n ? n.error : Vr(t, this.config.clientVersion, this.config.activeProvider); }
    getExternalAdapterError(t, r) { if (t.error_code === $p && r) {
        let n = t.meta?.id;
        ur(typeof n == "number", "Malformed external JS error received from the engine");
        let i = r.consumeError(n);
        return ur(i, "External error with reported id was not registered"), i;
    } }
    async metrics(t) { await this.start(); let r = await this.engine.metrics(JSON.stringify(t)); return t.format === "prometheus" ? r : this.parseEngineResponse(r); }
};
function Qp(e) { return typeof e == "object" && e !== null && e.error_code !== void 0; }
function Zn(e, t) { return qs({ binaryTarget: e.binaryTarget, title: t, version: e.config.clientVersion, engineVersion: e.versionInfo?.commit, database: e.config.activeProvider, query: e.lastQuery }); }
f();
c();
p();
d();
m();
function Us({ url: e, adapter: t, copyEngine: r, targetBuildType: n }) {
    let i = [], o = [], s = S => { i.push({ _tag: "warning", value: S }); }, a = S => {
        let I = S.join(`
`);
        o.push({ _tag: "error", value: I });
    }, l = !!e?.startsWith("prisma://"), u = En(e), g = !!t, h = l || u;
    !g && r && h && s(["recommend--no-engine", "In production, we recommend using `prisma generate --no-engine` (See: `prisma generate --help`)"]);
    let T = h || !r;
    g && (T || n === "edge") && (n === "edge" ? a(["Prisma Client was configured to use the `adapter` option but it was imported via its `/edge` endpoint.", "Please either remove the `/edge` endpoint or remove the `adapter` from the Prisma Client constructor."]) : r ? l && a(["Prisma Client was configured to use the `adapter` option but the URL was a `prisma://` URL.", "Please either use the `prisma://` URL or remove the `adapter` from the Prisma Client constructor."]) : a(["Prisma Client was configured to use the `adapter` option but `prisma generate` was run with `--no-engine`.", "Please run `prisma generate` without `--no-engine` to be able to use Prisma Client with the adapter."]));
    let k = { accelerate: T, ppg: u, driverAdapters: g };
    function A(S) { return S.length > 0; }
    return A(o) ? { ok: !1, diagnostics: { warnings: i, errors: o }, isUsing: k } : { ok: !0, diagnostics: { warnings: i }, isUsing: k };
}
function Vs({ copyEngine: e = !0 }, t) { let r; try {
    r = Jr({ inlineDatasources: t.inlineDatasources, overrideDatasources: t.overrideDatasources, env: { ...t.env, ...y.env }, clientVersion: t.clientVersion });
}
catch { } let { ok: n, isUsing: i, diagnostics: o } = Us({ url: r, adapter: t.adapter, copyEngine: e, targetBuildType: "react-native" }); for (let h of o.warnings)
    Dt(...h.value); if (!n) {
    let h = o.errors[0];
    throw new te(h.value, { clientVersion: t.clientVersion });
} let s = it(t.generator), a = s === "library", l = s === "binary", u = s === "client", g = (i.accelerate || i.ppg) && !i.driverAdapters; return new er(t); }
f();
c();
p();
d();
m();
function Wr({ generator: e }) { return e?.previewFeatures ?? []; }
f();
c();
p();
d();
m();
var Qs = e => ({ command: e });
f();
c();
p();
d();
m();
f();
c();
p();
d();
m();
var Gs = e => e.strings.reduce((t, r, n) => `${t}@P${n}${r}`);
f();
c();
p();
d();
m();
function vt(e) { try {
    return Js(e, "fast");
}
catch {
    return Js(e, "slow");
} }
function Js(e, t) { return JSON.stringify(e.map(r => Ks(r, t))); }
function Ks(e, t) { if (Array.isArray(e))
    return e.map(r => Ks(r, t)); if (typeof e == "bigint")
    return { prisma__type: "bigint", prisma__value: e.toString() }; if (ut(e))
    return { prisma__type: "date", prisma__value: e.toJSON() }; if (Ee.isDecimal(e))
    return { prisma__type: "decimal", prisma__value: e.toJSON() }; if (w.Buffer.isBuffer(e))
    return { prisma__type: "bytes", prisma__value: e.toString("base64") }; if (Gp(e))
    return { prisma__type: "bytes", prisma__value: w.Buffer.from(e).toString("base64") }; if (ArrayBuffer.isView(e)) {
    let { buffer: r, byteOffset: n, byteLength: i } = e;
    return { prisma__type: "bytes", prisma__value: w.Buffer.from(r, n, i).toString("base64") };
} return typeof e == "object" && t === "slow" ? Hs(e) : e; }
function Gp(e) { return e instanceof ArrayBuffer || e instanceof SharedArrayBuffer ? !0 : typeof e == "object" && e !== null ? e[Symbol.toStringTag] === "ArrayBuffer" || e[Symbol.toStringTag] === "SharedArrayBuffer" : !1; }
function Hs(e) { if (typeof e != "object" || e === null)
    return e; if (typeof e.toJSON == "function")
    return e.toJSON(); if (Array.isArray(e))
    return e.map(Ws); let t = {}; for (let r of Object.keys(e))
    t[r] = Ws(e[r]); return t; }
function Ws(e) { return typeof e == "bigint" ? e.toString() : Hs(e); }
var Jp = /^(\s*alter\s)/i, zs = H("prisma:client");
function Xn(e, t, r, n) {
    if (!(e !== "postgresql" && e !== "cockroachdb") && r.length > 0 && Jp.exec(t))
        throw new Error(`Running ALTER using ${n} is not supported
Using the example below you can still execute your query with Prisma, but please note that it is vulnerable to SQL injection attacks and requires you to take care of input sanitization.

Example:
  await prisma.$executeRawUnsafe(\`ALTER USER prisma WITH PASSWORD '\${password}'\`)

More Information: https://pris.ly/d/execute-raw
`);
}
var ei = ({ clientMethod: e, activeProvider: t }) => r => { let n = "", i; if (qr(r))
    n = r.sql, i = { values: vt(r.values), __prismaRawParameters__: !0 };
else if (Array.isArray(r)) {
    let [o, ...s] = r;
    n = o, i = { values: vt(s || []), __prismaRawParameters__: !0 };
}
else
    switch (t) {
        case "sqlite":
        case "mysql": {
            n = r.sql, i = { values: vt(r.values), __prismaRawParameters__: !0 };
            break;
        }
        case "cockroachdb":
        case "postgresql":
        case "postgres": {
            n = r.text, i = { values: vt(r.values), __prismaRawParameters__: !0 };
            break;
        }
        case "sqlserver": {
            n = Gs(r), i = { values: vt(r.values), __prismaRawParameters__: !0 };
            break;
        }
        default: throw new Error(`The ${t} provider does not support ${e}`);
    } return i?.values ? zs(`prisma.${e}(${n}, ${i.values})`) : zs(`prisma.${e}(${n})`), { query: n, parameters: i }; }, Ys = { requestArgsToMiddlewareArgs(e) { return [e.strings, ...e.values]; }, middlewareArgsToRequestArgs(e) { let [t, ...r] = e; return new le(t, r); } }, Zs = { requestArgsToMiddlewareArgs(e) { return [e]; }, middlewareArgsToRequestArgs(e) { return e[0]; } };
f();
c();
p();
d();
m();
function ti(e) { return function (r, n) { let i, o = (s = e) => { try {
    return s === void 0 || s?.kind === "itx" ? i ?? (i = Xs(r(s))) : Xs(r(s));
}
catch (a) {
    return Promise.reject(a);
} }; return { get spec() { return n; }, then(s, a) { return o().then(s, a); }, catch(s) { return o().catch(s); }, finally(s) { return o().finally(s); }, requestTransaction(s) { let a = o(s); return a.requestTransaction ? a.requestTransaction(s) : a; }, [Symbol.toStringTag]: "PrismaPromise" }; }; }
function Xs(e) { return typeof e.then == "function" ? e : Promise.resolve(e); }
f();
c();
p();
d();
m();
var Wp = hn.split(".")[0], Kp = { isEnabled() { return !1; }, getTraceParent() { return "00-10-10-00"; }, dispatchEngineSpans() { }, getActiveContext() { }, runInChildSpan(e, t) { return t(); } }, ri = class {
    isEnabled() { return this.getGlobalTracingHelper().isEnabled(); }
    getTraceParent(t) { return this.getGlobalTracingHelper().getTraceParent(t); }
    dispatchEngineSpans(t) { return this.getGlobalTracingHelper().dispatchEngineSpans(t); }
    getActiveContext() { return this.getGlobalTracingHelper().getActiveContext(); }
    runInChildSpan(t, r) { return this.getGlobalTracingHelper().runInChildSpan(t, r); }
    getGlobalTracingHelper() { let t = globalThis[`V${Wp}_PRISMA_INSTRUMENTATION`], r = globalThis.PRISMA_INSTRUMENTATION; return t?.helper ?? r?.helper ?? Kp; }
};
function ea() { return new ri; }
f();
c();
p();
d();
m();
function ta(e, t = () => { }) { let r, n = new Promise(i => r = i); return { then(i) { return --e === 0 && r(t()), i?.(n); } }; }
f();
c();
p();
d();
m();
function ra(e) { return typeof e == "string" ? e : e.reduce((t, r) => { let n = typeof r == "string" ? r : r.level; return n === "query" ? t : t && (r === "info" || t === "info") ? "info" : n; }, void 0); }
f();
c();
p();
d();
m();
var Kr = class {
    constructor() {
        this._middlewares = [];
    }
    use(t) { this._middlewares.push(t); }
    get(t) { return this._middlewares[t]; }
    has(t) { return !!this._middlewares[t]; }
    length() { return this._middlewares.length; }
};
f();
c();
p();
d();
m();
var ia = Re(Pn());
f();
c();
p();
d();
m();
function Hr(e) { return typeof e.batchRequestIdx == "number"; }
f();
c();
p();
d();
m();
function na(e) { if (e.action !== "findUnique" && e.action !== "findUniqueOrThrow")
    return; let t = []; return e.modelName && t.push(e.modelName), e.query.arguments && t.push(ni(e.query.arguments)), t.push(ni(e.query.selection)), t.join(""); }
function ni(e) { return `(${Object.keys(e).sort().map(r => { let n = e[r]; return typeof n == "object" && n !== null ? `(${r} ${ni(n)})` : r; }).join(" ")})`; }
f();
c();
p();
d();
m();
var Hp = { aggregate: !1, aggregateRaw: !1, createMany: !0, createManyAndReturn: !0, createOne: !0, deleteMany: !0, deleteOne: !0, executeRaw: !0, findFirst: !1, findFirstOrThrow: !1, findMany: !1, findRaw: !1, findUnique: !1, findUniqueOrThrow: !1, groupBy: !1, queryRaw: !1, runCommandRaw: !0, updateMany: !0, updateManyAndReturn: !0, updateOne: !0, upsertOne: !0 };
function ii(e) { return Hp[e]; }
f();
c();
p();
d();
m();
var zr = class {
    constructor(t) {
        this.tickActive = !1;
        this.options = t;
        this.batches = {};
    }
    request(t) { let r = this.options.batchBy(t); return r ? (this.batches[r] || (this.batches[r] = [], this.tickActive || (this.tickActive = !0, y.nextTick(() => { this.dispatchBatches(), this.tickActive = !1; }))), new Promise((n, i) => { this.batches[r].push({ request: t, resolve: n, reject: i }); })) : this.options.singleLoader(t); }
    dispatchBatches() { for (let t in this.batches) {
        let r = this.batches[t];
        delete this.batches[t], r.length === 1 ? this.options.singleLoader(r[0].request).then(n => { n instanceof Error ? r[0].reject(n) : r[0].resolve(n); }).catch(n => { r[0].reject(n); }) : (r.sort((n, i) => this.options.batchOrder(n.request, i.request)), this.options.batchLoader(r.map(n => n.request)).then(n => { if (n instanceof Error)
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
f();
c();
p();
d();
m();
function Ye(e, t) { if (t === null)
    return t; switch (e) {
    case "bigint": return BigInt(t);
    case "bytes": {
        let { buffer: r, byteOffset: n, byteLength: i } = w.Buffer.from(t, "base64");
        return new Uint8Array(r, n, i);
    }
    case "decimal": return new Ee(t);
    case "datetime":
    case "date": return new Date(t);
    case "time": return new Date(`1970-01-01T${t}Z`);
    case "bigint-array": return t.map(r => Ye("bigint", r));
    case "bytes-array": return t.map(r => Ye("bytes", r));
    case "decimal-array": return t.map(r => Ye("decimal", r));
    case "datetime-array": return t.map(r => Ye("datetime", r));
    case "date-array": return t.map(r => Ye("date", r));
    case "time-array": return t.map(r => Ye("time", r));
    default: return t;
} }
function Yr(e) { let t = [], r = zp(e); for (let n = 0; n < e.rows.length; n++) {
    let i = e.rows[n], o = { ...r };
    for (let s = 0; s < i.length; s++)
        o[e.columns[s]] = Ye(e.types[s], i[s]);
    t.push(o);
} return t; }
function zp(e) { let t = {}; for (let r = 0; r < e.columns.length; r++)
    t[e.columns[r]] = null; return t; }
var Yp = H("prisma:client:request_handler"), Zr = class {
    constructor(t, r) { this.logEmitter = r, this.client = t, this.dataloader = new zr({ batchLoader: As(async ({ requests: n, customDataProxyFetch: i }) => { let { transaction: o, otelParentCtx: s } = n[0], a = n.map(h => h.protocolQuery), l = this.client._tracingHelper.getTraceParent(s), u = n.some(h => ii(h.protocolQuery.action)); return (await this.client._engine.requestBatch(a, { traceparent: l, transaction: Zp(o), containsWrite: u, customDataProxyFetch: i })).map((h, T) => { if (h instanceof Error)
            return h; try {
            return this.mapQueryEngineResult(n[T], h);
        }
        catch (k) {
            return k;
        } }); }), singleLoader: async (n) => { let i = n.transaction?.kind === "itx" ? oa(n.transaction) : void 0, o = await this.client._engine.request(n.protocolQuery, { traceparent: this.client._tracingHelper.getTraceParent(), interactiveTransaction: i, isWrite: ii(n.protocolQuery.action), customDataProxyFetch: n.customDataProxyFetch }); return this.mapQueryEngineResult(n, o); }, batchBy: n => n.transaction?.id ? `transaction-${n.transaction.id}` : na(n.protocolQuery), batchOrder(n, i) { return n.transaction?.kind === "batch" && i.transaction?.kind === "batch" ? n.transaction.index - i.transaction.index : 0; } }); }
    async request(t) { try {
        return await this.dataloader.request(t);
    }
    catch (r) {
        let { clientMethod: n, callsite: i, transaction: o, args: s, modelName: a } = t;
        this.handleAndLogRequestError({ error: r, clientMethod: n, callsite: i, transaction: o, args: s, modelName: a, globalOmit: t.globalOmit });
    } }
    mapQueryEngineResult({ dataPath: t, unpacker: r }, n) { let i = n?.data, o = this.unpack(i, t, r); return y.env.PRISMA_CLIENT_GET_TIME ? { data: o } : o; }
    handleAndLogRequestError(t) { try {
        this.handleRequestError(t);
    }
    catch (r) {
        throw this.logEmitter && this.logEmitter.emit("error", { message: r.message, target: t.clientMethod, timestamp: new Date }), r;
    } }
    handleRequestError({ error: t, clientMethod: r, callsite: n, transaction: i, args: o, modelName: s, globalOmit: a }) { if (Yp(t), Xp(t, i))
        throw t; if (t instanceof se && ed(t)) {
        let u = sa(t.meta);
        Fr({ args: o, errors: [u], callsite: n, errorFormat: this.client._errorFormat, originalMethod: r, clientVersion: this.client._clientVersion, globalOmit: a });
    } let l = t.message; if (n && (l = Pr({ callsite: n, originalMethod: r, isPanic: t.isPanic, showColors: this.client._errorFormat === "pretty", message: l })), l = this.sanitizeMessage(l), t.code) {
        let u = s ? { modelName: s, ...t.meta } : t.meta;
        throw new se(l, { code: t.code, clientVersion: this.client._clientVersion, meta: u, batchRequestIdx: t.batchRequestIdx });
    }
    else {
        if (t.isPanic)
            throw new ce(l, this.client._clientVersion);
        if (t instanceof J)
            throw new J(l, { clientVersion: this.client._clientVersion, batchRequestIdx: t.batchRequestIdx });
        if (t instanceof Q)
            throw new Q(l, this.client._clientVersion);
        if (t instanceof ce)
            throw new ce(l, this.client._clientVersion);
    } throw t.clientVersion = this.client._clientVersion, t; }
    sanitizeMessage(t) { return this.client._errorFormat && this.client._errorFormat !== "pretty" ? (0, ia.default)(t) : t; }
    unpack(t, r, n) { if (!t || (t.data && (t = t.data), !t))
        return t; let i = Object.keys(t)[0], o = Object.values(t)[0], s = r.filter(u => u !== "select" && u !== "include"), a = Gn(o, s), l = i === "queryRaw" ? Yr(a) : lt(a); return n ? n(l) : l; }
    get [Symbol.toStringTag]() { return "RequestHandler"; }
};
function Zp(e) { if (e) {
    if (e.kind === "batch")
        return { kind: "batch", options: { isolationLevel: e.isolationLevel } };
    if (e.kind === "itx")
        return { kind: "itx", options: oa(e) };
    Me(e, "Unknown transaction kind");
} }
function oa(e) { return { id: e.id, payload: e.payload }; }
function Xp(e, t) { return Hr(e) && t?.kind === "batch" && e.batchRequestIdx !== t.index; }
function ed(e) { return e.code === "P2009" || e.code === "P2012"; }
function sa(e) { if (e.kind === "Union")
    return { kind: "Union", errors: e.errors.map(sa) }; if (Array.isArray(e.selectionPath)) {
    let [, ...t] = e.selectionPath;
    return { ...e, selectionPath: t };
} return e; }
f();
c();
p();
d();
m();
var aa = $s;
f();
c();
p();
d();
m();
var da = Re(Fn());
f();
c();
p();
d();
m();
var $ = class extends Error {
    constructor(t) {
        super(t + `
Read more at https://pris.ly/d/client-constructor`), this.name = "PrismaClientConstructorValidationError";
    }
    get [Symbol.toStringTag]() { return "PrismaClientConstructorValidationError"; }
};
ue($, "PrismaClientConstructorValidationError");
var la = ["datasources", "datasourceUrl", "errorFormat", "adapter", "log", "transactionOptions", "omit", "__internal"], ua = ["pretty", "colorless", "minimal"], ca = ["info", "query", "warn", "error"], td = { datasources: (e, { datasourceNames: t }) => {
        if (e) {
            if (typeof e != "object" || Array.isArray(e))
                throw new $(`Invalid value ${JSON.stringify(e)} for "datasources" provided to PrismaClient constructor`);
            for (let [r, n] of Object.entries(e)) {
                if (!t.includes(r)) {
                    let i = Tt(r, t) || ` Available datasources: ${t.join(", ")}`;
                    throw new $(`Unknown datasource ${r} provided to PrismaClient constructor.${i}`);
                }
                if (typeof n != "object" || Array.isArray(n))
                    throw new $(`Invalid value ${JSON.stringify(e)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
                if (n && typeof n == "object")
                    for (let [i, o] of Object.entries(n)) {
                        if (i !== "url")
                            throw new $(`Invalid value ${JSON.stringify(e)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
                        if (typeof o != "string")
                            throw new $(`Invalid value ${JSON.stringify(o)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
                    }
            }
        }
    }, adapter: (e, t) => { if (!e && it(t.generator) === "client")
        throw new $('Using engine type "client" requires a driver adapter to be provided to PrismaClient constructor.'); if (e === null)
        return; if (e === void 0)
        throw new $('"adapter" property must not be undefined, use null to conditionally disable driver adapters.'); if (!Wr(t).includes("driverAdapters"))
        throw new $('"adapter" property can only be provided to PrismaClient constructor when "driverAdapters" preview feature is enabled.'); if (it(t.generator) === "binary")
        throw new $('Cannot use a driver adapter with the "binary" Query Engine. Please use the "library" Query Engine.'); }, datasourceUrl: e => {
        if (typeof e < "u" && typeof e != "string")
            throw new $(`Invalid value ${JSON.stringify(e)} for "datasourceUrl" provided to PrismaClient constructor.
Expected string or undefined.`);
    }, errorFormat: e => { if (e) {
        if (typeof e != "string")
            throw new $(`Invalid value ${JSON.stringify(e)} for "errorFormat" provided to PrismaClient constructor.`);
        if (!ua.includes(e)) {
            let t = Tt(e, ua);
            throw new $(`Invalid errorFormat ${e} provided to PrismaClient constructor.${t}`);
        }
    } }, log: e => { if (!e)
        return; if (!Array.isArray(e))
        throw new $(`Invalid value ${JSON.stringify(e)} for "log" provided to PrismaClient constructor.`); function t(r) { if (typeof r == "string" && !ca.includes(r)) {
        let n = Tt(r, ca);
        throw new $(`Invalid log level "${r}" provided to PrismaClient constructor.${n}`);
    } } for (let r of e) {
        t(r);
        let n = { level: t, emit: i => { let o = ["stdout", "event"]; if (!o.includes(i)) {
                let s = Tt(i, o);
                throw new $(`Invalid value ${JSON.stringify(i)} for "emit" in logLevel provided to PrismaClient constructor.${s}`);
            } } };
        if (r && typeof r == "object")
            for (let [i, o] of Object.entries(r))
                if (n[i])
                    n[i](o);
                else
                    throw new $(`Invalid property ${i} for "log" provided to PrismaClient constructor`);
    } }, transactionOptions: e => { if (!e)
        return; let t = e.maxWait; if (t != null && t <= 0)
        throw new $(`Invalid value ${t} for maxWait in "transactionOptions" provided to PrismaClient constructor. maxWait needs to be greater than 0`); let r = e.timeout; if (r != null && r <= 0)
        throw new $(`Invalid value ${r} for timeout in "transactionOptions" provided to PrismaClient constructor. timeout needs to be greater than 0`); }, omit: (e, t) => { if (typeof e != "object")
        throw new $('"omit" option is expected to be an object.'); if (e === null)
        throw new $('"omit" option can not be `null`'); let r = []; for (let [n, i] of Object.entries(e)) {
        let o = nd(n, t.runtimeDataModel);
        if (!o) {
            r.push({ kind: "UnknownModel", modelKey: n });
            continue;
        }
        for (let [s, a] of Object.entries(i)) {
            let l = o.fields.find(u => u.name === s);
            if (!l) {
                r.push({ kind: "UnknownField", modelKey: n, fieldName: s });
                continue;
            }
            if (l.relationName) {
                r.push({ kind: "RelationInOmit", modelKey: n, fieldName: s });
                continue;
            }
            typeof a != "boolean" && r.push({ kind: "InvalidFieldValue", modelKey: n, fieldName: s });
        }
    } if (r.length > 0)
        throw new $(id(e, r)); }, __internal: e => { if (!e)
        return; let t = ["debug", "engine", "configOverride"]; if (typeof e != "object")
        throw new $(`Invalid value ${JSON.stringify(e)} for "__internal" to PrismaClient constructor`); for (let [r] of Object.entries(e))
        if (!t.includes(r)) {
            let n = Tt(r, t);
            throw new $(`Invalid property ${JSON.stringify(r)} for "__internal" provided to PrismaClient constructor.${n}`);
        } } };
function ma(e, t) { for (let [r, n] of Object.entries(e)) {
    if (!la.includes(r)) {
        let i = Tt(r, la);
        throw new $(`Unknown property ${r} provided to PrismaClient constructor.${i}`);
    }
    td[r](n, t);
} if (e.datasourceUrl && e.datasources)
    throw new $('Can not use "datasourceUrl" and "datasources" options at the same time. Pick one of them'); }
function Tt(e, t) { if (t.length === 0 || typeof e != "string")
    return ""; let r = rd(e, t); return r ? ` Did you mean "${r}"?` : ""; }
function rd(e, t) { if (t.length === 0)
    return null; let r = t.map(i => ({ value: i, distance: (0, da.default)(e, i) })); r.sort((i, o) => i.distance < o.distance ? -1 : 1); let n = r[0]; return n.distance < 3 ? n.value : null; }
function nd(e, t) { return pa(t.models, e) ?? pa(t.types, e); }
function pa(e, t) { let r = Object.keys(e).find(n => je(n) === t); if (r)
    return e[r]; }
function id(e, t) {
    let r = wt(e);
    for (let o of t)
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
    let { message: n, args: i } = Ir(r, "colorless");
    return `Error validating "omit" option:

${i}

${n}`;
}
f();
c();
p();
d();
m();
function fa(e) { return e.length === 0 ? Promise.resolve([]) : new Promise((t, r) => { let n = new Array(e.length), i = null, o = !1, s = 0, a = () => { o || (s++, s === e.length && (o = !0, i ? r(i) : t(n))); }, l = u => { o || (o = !0, r(u)); }; for (let u = 0; u < e.length; u++)
    e[u].then(g => { n[u] = g, a(); }, g => { if (!Hr(g)) {
        l(g);
        return;
    } g.batchRequestIdx === u ? l(g) : (i || (i = g), a()); }); }); }
var Qe = H("prisma:client");
typeof globalThis == "object" && (globalThis.NODE_CLIENT = !0);
var od = { requestArgsToMiddlewareArgs: e => e, middlewareArgsToRequestArgs: e => e }, sd = Symbol.for("prisma.client.transaction.id"), ad = { id: 0, nextId() { return ++this.id; } };
function ya(e) {
    class t {
        constructor(n) {
            this._originalClient = this;
            this._middlewares = new Kr;
            this._createPrismaPromise = ti();
            this.$metrics = new Et(this);
            this.$extends = ys;
            e = n?.__internal?.configOverride?.(e) ?? e, Is(e), n && ma(n, e);
            let i = new $r().on("error", () => { });
            this._extensions = bt.empty(), this._previewFeatures = Wr(e), this._clientVersion = e.clientVersion ?? aa, this._activeProvider = e.activeProvider, this._globalOmit = n?.omit, this._tracingHelper = ea();
            let o = e.relativeEnvPaths && { rootEnvPath: e.relativeEnvPaths.rootEnvPath && Ie.resolve(e.dirname, e.relativeEnvPaths.rootEnvPath), schemaEnvPath: e.relativeEnvPaths.schemaEnvPath && Ie.resolve(e.dirname, e.relativeEnvPaths.schemaEnvPath) }, s;
            if (n?.adapter) {
                s = n.adapter;
                let l = e.activeProvider === "postgresql" || e.activeProvider === "cockroachdb" ? "postgres" : e.activeProvider;
                if (s.provider !== l)
                    throw new Q(`The Driver Adapter \`${s.adapterName}\`, based on \`${s.provider}\`, is not compatible with the provider \`${l}\` specified in the Prisma schema.`, this._clientVersion);
                if (n.datasources || n.datasourceUrl !== void 0)
                    throw new Q("Custom datasource configuration is not compatible with Prisma Driver Adapters. Please define the database connection string directly in the Driver Adapter configuration.", this._clientVersion);
            }
            let a = e.injectableEdgeEnv?.();
            try {
                let l = n ?? {}, u = l.__internal ?? {}, g = u.debug === !0;
                g && H.enable("prisma:client");
                let h = Ie.resolve(e.dirname, e.relativePath);
                sr.existsSync(h) || (h = e.dirname), Qe("dirname", e.dirname), Qe("relativePath", e.relativePath), Qe("cwd", h);
                let T = u.engine || {};
                if (l.errorFormat ? this._errorFormat = l.errorFormat : y.env.NODE_ENV === "production" ? this._errorFormat = "minimal" : y.env.NO_COLOR ? this._errorFormat = "colorless" : this._errorFormat = "colorless", this._runtimeDataModel = e.runtimeDataModel, this._engineConfig = { cwd: h, dirname: e.dirname, enableDebugLogs: g, allowTriggerPanic: T.allowTriggerPanic, prismaPath: T.binaryPath ?? void 0, engineEndpoint: T.endpoint, generator: e.generator, showColors: this._errorFormat === "pretty", logLevel: l.log && ra(l.log), logQueries: l.log && !!(typeof l.log == "string" ? l.log === "query" : l.log.find(k => typeof k == "string" ? k === "query" : k.level === "query")), env: a?.parsed ?? {}, flags: [], engineWasm: e.engineWasm, compilerWasm: e.compilerWasm, clientVersion: e.clientVersion, engineVersion: e.engineVersion, previewFeatures: this._previewFeatures, activeProvider: e.activeProvider, inlineSchema: e.inlineSchema, overrideDatasources: Fs(l, e.datasourceNames), inlineDatasources: e.inlineDatasources, inlineSchemaHash: e.inlineSchemaHash, tracingHelper: this._tracingHelper, transactionOptions: { maxWait: l.transactionOptions?.maxWait ?? 2e3, timeout: l.transactionOptions?.timeout ?? 5e3, isolationLevel: l.transactionOptions?.isolationLevel }, logEmitter: i, isBundled: e.isBundled, adapter: s }, this._accelerateEngineConfig = { ...this._engineConfig, accelerateUtils: { resolveDatasourceUrl: Jr, getBatchRequestPayload: Ur, prismaGraphQLToJSError: Vr, PrismaClientUnknownRequestError: J, PrismaClientInitializationError: Q, PrismaClientKnownRequestError: se, debug: H("prisma:client:accelerateEngine"), engineVersion: ha.version, clientVersion: e.clientVersion } }, Qe("clientVersion", e.clientVersion), this._engine = Vs(e, this._engineConfig), this._requestHandler = new Zr(this, i), l.log)
                    for (let k of l.log) {
                        let A = typeof k == "string" ? k : k.emit === "stdout" ? k.level : null;
                        A && this.$on(A, S => { Lt.log(`${Lt.tags[A] ?? ""}`, S.message || S.query); });
                    }
            }
            catch (l) {
                throw l.clientVersion = this._clientVersion, l;
            }
            return this._appliedParent = Zt(this);
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
            Di();
        } }
        $executeRawInternal(n, i, o, s) { let a = this._activeProvider; return this._request({ action: "executeRaw", args: o, transaction: n, clientMethod: i, argsMapper: ei({ clientMethod: i, activeProvider: a }), callsite: Ve(this._errorFormat), dataPath: [], middlewareArgsMapper: s }); }
        $executeRaw(n, ...i) { return this._createPrismaPromise(o => { if (n.raw !== void 0 || n.sql !== void 0) {
            let [s, a] = ga(n, i);
            return Xn(this._activeProvider, s.text, s.values, Array.isArray(n) ? "prisma.$executeRaw`<SQL>`" : "prisma.$executeRaw(sql`<SQL>`)"), this.$executeRawInternal(o, "$executeRaw", s, a);
        } throw new te("`$executeRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw\n", { clientVersion: this._clientVersion }); }); }
        $executeRawUnsafe(n, ...i) { return this._createPrismaPromise(o => (Xn(this._activeProvider, n, i, "prisma.$executeRawUnsafe(<SQL>, [...values])"), this.$executeRawInternal(o, "$executeRawUnsafe", [n, ...i]))); }
        $runCommandRaw(n) { if (e.activeProvider !== "mongodb")
            throw new te(`The ${e.activeProvider} provider does not support $runCommandRaw. Use the mongodb provider.`, { clientVersion: this._clientVersion }); return this._createPrismaPromise(i => this._request({ args: n, clientMethod: "$runCommandRaw", dataPath: [], action: "runCommandRaw", argsMapper: Qs, callsite: Ve(this._errorFormat), transaction: i })); }
        async $queryRawInternal(n, i, o, s) { let a = this._activeProvider; return this._request({ action: "queryRaw", args: o, transaction: n, clientMethod: i, argsMapper: ei({ clientMethod: i, activeProvider: a }), callsite: Ve(this._errorFormat), dataPath: [], middlewareArgsMapper: s }); }
        $queryRaw(n, ...i) { return this._createPrismaPromise(o => { if (n.raw !== void 0 || n.sql !== void 0)
            return this.$queryRawInternal(o, "$queryRaw", ...ga(n, i)); throw new te("`$queryRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw\n", { clientVersion: this._clientVersion }); }); }
        $queryRawTyped(n) { return this._createPrismaPromise(i => { if (!this._hasPreviewFlag("typedSql"))
            throw new te("`typedSql` preview feature must be enabled in order to access $queryRawTyped API", { clientVersion: this._clientVersion }); return this.$queryRawInternal(i, "$queryRawTyped", n); }); }
        $queryRawUnsafe(n, ...i) { return this._createPrismaPromise(o => this.$queryRawInternal(o, "$queryRawUnsafe", [n, ...i])); }
        _transactionWithArray({ promises: n, options: i }) { let o = ad.nextId(), s = ta(n.length), a = n.map((l, u) => { if (l?.[Symbol.toStringTag] !== "PrismaPromise")
            throw new Error("All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function."); let g = i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel, h = { kind: "batch", id: o, index: u, isolationLevel: g, lock: s }; return l.requestTransaction?.(h) ?? l; }); return fa(a); }
        async _transactionWithCallback({ callback: n, options: i }) { let o = { traceparent: this._tracingHelper.getTraceParent() }, s = { maxWait: i?.maxWait ?? this._engineConfig.transactionOptions.maxWait, timeout: i?.timeout ?? this._engineConfig.transactionOptions.timeout, isolationLevel: i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel }, a = await this._engine.transaction("start", o, s), l; try {
            let u = { kind: "itx", ...a };
            l = await n(this._createItxClient(u)), await this._engine.transaction("commit", o, a);
        }
        catch (u) {
            throw await this._engine.transaction("rollback", o, a).catch(() => { }), u;
        } return l; }
        _createItxClient(n) { return ge(Zt(ge(hs(this), [ne("_appliedParent", () => this._appliedParent._createItxClient(n)), ne("_createPrismaPromise", () => ti(n)), ne(sd, () => n.id)])), [xt(xs)]); }
        $transaction(n, i) { let o; typeof n == "function" ? this._engineConfig.adapter?.adapterName === "@prisma/adapter-d1" ? o = () => { throw new Error("Cloudflare D1 does not support interactive transactions. We recommend you to refactor your queries with that limitation in mind, and use batch transactions with `prisma.$transactions([])` where applicable."); } : o = () => this._transactionWithCallback({ callback: n, options: i }) : o = () => this._transactionWithArray({ promises: n, options: i }); let s = { name: "transaction", attributes: { method: "$transaction" } }; return this._tracingHelper.runInChildSpan(s, o); }
        _request(n) { n.otelParentCtx = this._tracingHelper.getActiveContext(); let i = n.middlewareArgsMapper ?? od, o = { args: i.requestArgsToMiddlewareArgs(n.args), dataPath: n.dataPath, runInTransaction: !!n.transaction, action: n.action, model: n.model }, s = { middleware: { name: "middleware", middleware: !0, attributes: { method: "$use" }, active: !1 }, operation: { name: "operation", attributes: { method: o.action, model: o.model, name: o.model ? `${o.model}.${o.action}` : o.action } } }, a = -1, l = async (u) => { let g = this._middlewares.get(++a); if (g)
            return this._tracingHelper.runInChildSpan(s.middleware, I => g(u, _ => (I?.end(), l(_)))); let { runInTransaction: h, args: T, ...k } = u, A = { ...n, ...k }; T && (A.args = i.middlewareArgsToRequestArgs(T)), n.transaction !== void 0 && h === !1 && delete A.transaction; let S = await Cs(this, A); return A.model ? Es({ result: S, modelName: A.model, args: A.args, extensions: this._extensions, runtimeDataModel: this._runtimeDataModel, globalOmit: this._globalOmit }) : S; }; return this._tracingHelper.runInChildSpan(s.operation, () => l(o)); }
        async _executeRequest({ args: n, clientMethod: i, dataPath: o, callsite: s, action: a, model: l, argsMapper: u, transaction: g, unpacker: h, otelParentCtx: T, customDataProxyFetch: k }) {
            try {
                n = u ? u(n) : n;
                let A = { name: "serialize" }, S = this._tracingHelper.runInChildSpan(A, () => Dr({ modelName: l, runtimeDataModel: this._runtimeDataModel, action: a, args: n, clientMethod: i, callsite: s, extensions: this._extensions, errorFormat: this._errorFormat, clientVersion: this._clientVersion, previewFeatures: this._previewFeatures, globalOmit: this._globalOmit }));
                return H.enabled("prisma:client") && (Qe("Prisma Client call:"), Qe(`prisma.${i}(${os(n)})`), Qe("Generated request:"), Qe(JSON.stringify(S, null, 2) + `
`)), g?.kind === "batch" && await g.lock, this._requestHandler.request({ protocolQuery: S, modelName: l, action: a, clientMethod: i, dataPath: o, callsite: s, args: n, extensions: this._extensions, transaction: g, unpacker: h, otelParentCtx: T, otelChildCtx: this._tracingHelper.getActiveContext(), globalOmit: this._globalOmit, customDataProxyFetch: k });
            }
            catch (A) {
                throw A.clientVersion = this._clientVersion, A;
            }
        }
        _hasPreviewFlag(n) { return !!this._engineConfig.previewFeatures?.includes(n); }
        $applyPendingMigrations() { return this._engine.applyPendingMigrations(); }
    }
    return t;
}
function ga(e, t) { return ld(e) ? [new le(e, t), Ys] : [e, Zs]; }
function ld(e) { return Array.isArray(e) && Array.isArray(e.raw); }
f();
c();
p();
d();
m();
var ud = new Set(["toJSON", "$$typeof", "asymmetricMatch", Symbol.iterator, Symbol.toStringTag, Symbol.isConcatSpreadable, Symbol.toPrimitive]);
function wa(e) { return new Proxy(e, { get(t, r) { if (r in t)
        return t[r]; if (!ud.has(r))
        throw new TypeError(`Invalid enum value: ${String(r)}`); } }); }
f();
c();
p();
d();
m();
0 && (module.exports = { DMMF, Debug, Decimal, Extensions, MetricsClient, PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError, Public, Sql, createParam, defineDmmfProperty, deserializeJsonResponse, deserializeRawResult, dmmfToRuntimeDataModel, empty, getPrismaClient, getRuntime, join, makeStrictEnum, makeTypedQueryFactory, objectEnumValues, raw, serializeJsonQuery, skip, sqltag, warnEnvConflicts, warnOnce });
//# sourceMappingURL=react-native.js.map