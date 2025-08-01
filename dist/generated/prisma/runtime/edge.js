"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Ut_e, _b, _Bt_e, _f, _qt_e, _g, _en_instances, _en_e, _h;
var va = Object.create;
var ur = Object.defineProperty;
var Ta = Object.getOwnPropertyDescriptor;
var Aa = Object.getOwnPropertyNames;
var Ca = Object.getPrototypeOf, Ra = Object.prototype.hasOwnProperty;
var de = (e, t) => () => (e && (t = e(e = 0)), t);
var Se = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Tt = (e, t) => { for (var r in t)
    ur(e, r, { get: t[r], enumerable: !0 }); }, ci = (e, t, r, n) => { if (t && typeof t == "object" || typeof t == "function")
    for (let i of Aa(t))
        !Ra.call(e, i) && i !== r && ur(e, i, { get: () => t[i], enumerable: !(n = Ta(t, i)) || n.enumerable }); return e; };
var Ue = (e, t, r) => (r = e != null ? va(Ca(e)) : {}, ci(t || !e || !e.__esModule ? ur(r, "default", { value: e, enumerable: !0 }) : r, e)), Sa = e => ci(ur({}, "__esModule", { value: !0 }), e);
var y, b, u = de(() => {
    "use strict";
    y = { nextTick: (e, ...t) => { setTimeout(() => { e(...t); }, 0); }, env: {}, version: "", cwd: () => "/", stderr: {}, argv: ["/bin/node"], pid: 1e4 }, { cwd: b } = y;
});
var x, c = de(() => {
    "use strict";
    x = globalThis.performance ?? (() => { let e = Date.now(); return { now: () => Date.now() - e }; })();
});
var E, p = de(() => {
    "use strict";
    E = () => { };
    E.prototype = E;
});
var m = de(() => {
    "use strict";
});
var ki = Se(ze => {
    "use strict";
    d();
    u();
    c();
    p();
    m();
    var gi = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), ka = gi(e => {
        "use strict";
        e.byteLength = l, e.toByteArray = g, e.fromByteArray = k;
        var t = [], r = [], n = typeof Uint8Array < "u" ? Uint8Array : Array, i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for (o = 0, s = i.length; o < s; ++o)
            t[o] = i[o], r[i.charCodeAt(o)] = o;
        var o, s;
        r[45] = 62, r[95] = 63;
        function a(C) { var S = C.length; if (S % 4 > 0)
            throw new Error("Invalid string. Length must be a multiple of 4"); var M = C.indexOf("="); M === -1 && (M = S); var _ = M === S ? 0 : 4 - M % 4; return [M, _]; }
        function l(C) { var S = a(C), M = S[0], _ = S[1]; return (M + _) * 3 / 4 - _; }
        function f(C, S, M) { return (S + M) * 3 / 4 - M; }
        function g(C) { var S, M = a(C), _ = M[0], B = M[1], I = new n(f(C, _, B)), L = 0, le = B > 0 ? _ - 4 : _, Q; for (Q = 0; Q < le; Q += 4)
            S = r[C.charCodeAt(Q)] << 18 | r[C.charCodeAt(Q + 1)] << 12 | r[C.charCodeAt(Q + 2)] << 6 | r[C.charCodeAt(Q + 3)], I[L++] = S >> 16 & 255, I[L++] = S >> 8 & 255, I[L++] = S & 255; return B === 2 && (S = r[C.charCodeAt(Q)] << 2 | r[C.charCodeAt(Q + 1)] >> 4, I[L++] = S & 255), B === 1 && (S = r[C.charCodeAt(Q)] << 10 | r[C.charCodeAt(Q + 1)] << 4 | r[C.charCodeAt(Q + 2)] >> 2, I[L++] = S >> 8 & 255, I[L++] = S & 255), I; }
        function h(C) { return t[C >> 18 & 63] + t[C >> 12 & 63] + t[C >> 6 & 63] + t[C & 63]; }
        function T(C, S, M) { for (var _, B = [], I = S; I < M; I += 3)
            _ = (C[I] << 16 & 16711680) + (C[I + 1] << 8 & 65280) + (C[I + 2] & 255), B.push(h(_)); return B.join(""); }
        function k(C) { for (var S, M = C.length, _ = M % 3, B = [], I = 16383, L = 0, le = M - _; L < le; L += I)
            B.push(T(C, L, L + I > le ? le : L + I)); return _ === 1 ? (S = C[M - 1], B.push(t[S >> 2] + t[S << 4 & 63] + "==")) : _ === 2 && (S = (C[M - 2] << 8) + C[M - 1], B.push(t[S >> 10] + t[S >> 4 & 63] + t[S << 2 & 63] + "=")), B.join(""); }
    }), Ia = gi(e => { e.read = function (t, r, n, i, o) { var s, a, l = o * 8 - i - 1, f = (1 << l) - 1, g = f >> 1, h = -7, T = n ? o - 1 : 0, k = n ? -1 : 1, C = t[r + T]; for (T += k, s = C & (1 << -h) - 1, C >>= -h, h += l; h > 0; s = s * 256 + t[r + T], T += k, h -= 8)
        ; for (a = s & (1 << -h) - 1, s >>= -h, h += i; h > 0; a = a * 256 + t[r + T], T += k, h -= 8)
        ; if (s === 0)
        s = 1 - g;
    else {
        if (s === f)
            return a ? NaN : (C ? -1 : 1) * (1 / 0);
        a = a + Math.pow(2, i), s = s - g;
    } return (C ? -1 : 1) * a * Math.pow(2, s - i); }, e.write = function (t, r, n, i, o, s) { var a, l, f, g = s * 8 - o - 1, h = (1 << g) - 1, T = h >> 1, k = o === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, C = i ? 0 : s - 1, S = i ? 1 : -1, M = r < 0 || r === 0 && 1 / r < 0 ? 1 : 0; for (r = Math.abs(r), isNaN(r) || r === 1 / 0 ? (l = isNaN(r) ? 1 : 0, a = h) : (a = Math.floor(Math.log(r) / Math.LN2), r * (f = Math.pow(2, -a)) < 1 && (a--, f *= 2), a + T >= 1 ? r += k / f : r += k * Math.pow(2, 1 - T), r * f >= 2 && (a++, f /= 2), a + T >= h ? (l = 0, a = h) : a + T >= 1 ? (l = (r * f - 1) * Math.pow(2, o), a = a + T) : (l = r * Math.pow(2, T - 1) * Math.pow(2, o), a = 0)); o >= 8; t[n + C] = l & 255, C += S, l /= 256, o -= 8)
        ; for (a = a << o | l, g += o; g > 0; t[n + C] = a & 255, C += S, a /= 256, g -= 8)
        ; t[n + C - S] |= M * 128; }; }), pn = ka(), Ke = Ia(), pi = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
    ze.Buffer = A;
    ze.SlowBuffer = Fa;
    ze.INSPECT_MAX_BYTES = 50;
    var cr = 2147483647;
    ze.kMaxLength = cr;
    A.TYPED_ARRAY_SUPPORT = Oa();
    !A.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
    function Oa() { try {
        let e = new Uint8Array(1), t = { foo: function () { return 42; } };
        return Object.setPrototypeOf(t, Uint8Array.prototype), Object.setPrototypeOf(e, t), e.foo() === 42;
    }
    catch {
        return !1;
    } }
    Object.defineProperty(A.prototype, "parent", { enumerable: !0, get: function () { if (A.isBuffer(this))
            return this.buffer; } });
    Object.defineProperty(A.prototype, "offset", { enumerable: !0, get: function () { if (A.isBuffer(this))
            return this.byteOffset; } });
    function Pe(e) { if (e > cr)
        throw new RangeError('The value "' + e + '" is invalid for option "size"'); let t = new Uint8Array(e); return Object.setPrototypeOf(t, A.prototype), t; }
    function A(e, t, r) { if (typeof e == "number") {
        if (typeof t == "string")
            throw new TypeError('The "string" argument must be of type string. Received type number');
        return fn(e);
    } return hi(e, t, r); }
    A.poolSize = 8192;
    function hi(e, t, r) { if (typeof e == "string")
        return Ma(e, t); if (ArrayBuffer.isView(e))
        return _a(e); if (e == null)
        throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e); if (fe(e, ArrayBuffer) || e && fe(e.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (fe(e, SharedArrayBuffer) || e && fe(e.buffer, SharedArrayBuffer)))
        return wi(e, t, r); if (typeof e == "number")
        throw new TypeError('The "value" argument must not be of type number. Received type number'); let n = e.valueOf && e.valueOf(); if (n != null && n !== e)
        return A.from(n, t, r); let i = Na(e); if (i)
        return i; if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof e[Symbol.toPrimitive] == "function")
        return A.from(e[Symbol.toPrimitive]("string"), t, r); throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof e); }
    A.from = function (e, t, r) { return hi(e, t, r); };
    Object.setPrototypeOf(A.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(A, Uint8Array);
    function yi(e) { if (typeof e != "number")
        throw new TypeError('"size" argument must be of type number'); if (e < 0)
        throw new RangeError('The value "' + e + '" is invalid for option "size"'); }
    function Da(e, t, r) { return yi(e), e <= 0 ? Pe(e) : t !== void 0 ? typeof r == "string" ? Pe(e).fill(t, r) : Pe(e).fill(t) : Pe(e); }
    A.alloc = function (e, t, r) { return Da(e, t, r); };
    function fn(e) { return yi(e), Pe(e < 0 ? 0 : gn(e) | 0); }
    A.allocUnsafe = function (e) { return fn(e); };
    A.allocUnsafeSlow = function (e) { return fn(e); };
    function Ma(e, t) { if ((typeof t != "string" || t === "") && (t = "utf8"), !A.isEncoding(t))
        throw new TypeError("Unknown encoding: " + t); let r = Ei(e, t) | 0, n = Pe(r), i = n.write(e, t); return i !== r && (n = n.slice(0, i)), n; }
    function mn(e) { let t = e.length < 0 ? 0 : gn(e.length) | 0, r = Pe(t); for (let n = 0; n < t; n += 1)
        r[n] = e[n] & 255; return r; }
    function _a(e) { if (fe(e, Uint8Array)) {
        let t = new Uint8Array(e);
        return wi(t.buffer, t.byteOffset, t.byteLength);
    } return mn(e); }
    function wi(e, t, r) { if (t < 0 || e.byteLength < t)
        throw new RangeError('"offset" is outside of buffer bounds'); if (e.byteLength < t + (r || 0))
        throw new RangeError('"length" is outside of buffer bounds'); let n; return t === void 0 && r === void 0 ? n = new Uint8Array(e) : r === void 0 ? n = new Uint8Array(e, t) : n = new Uint8Array(e, t, r), Object.setPrototypeOf(n, A.prototype), n; }
    function Na(e) { if (A.isBuffer(e)) {
        let t = gn(e.length) | 0, r = Pe(t);
        return r.length === 0 || e.copy(r, 0, 0, t), r;
    } if (e.length !== void 0)
        return typeof e.length != "number" || yn(e.length) ? Pe(0) : mn(e); if (e.type === "Buffer" && Array.isArray(e.data))
        return mn(e.data); }
    function gn(e) { if (e >= cr)
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + cr.toString(16) + " bytes"); return e | 0; }
    function Fa(e) { return +e != e && (e = 0), A.alloc(+e); }
    A.isBuffer = function (e) { return e != null && e._isBuffer === !0 && e !== A.prototype; };
    A.compare = function (e, t) { if (fe(e, Uint8Array) && (e = A.from(e, e.offset, e.byteLength)), fe(t, Uint8Array) && (t = A.from(t, t.offset, t.byteLength)), !A.isBuffer(e) || !A.isBuffer(t))
        throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'); if (e === t)
        return 0; let r = e.length, n = t.length; for (let i = 0, o = Math.min(r, n); i < o; ++i)
        if (e[i] !== t[i]) {
            r = e[i], n = t[i];
            break;
        } return r < n ? -1 : n < r ? 1 : 0; };
    A.isEncoding = function (e) { switch (String(e).toLowerCase()) {
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
    A.concat = function (e, t) { if (!Array.isArray(e))
        throw new TypeError('"list" argument must be an Array of Buffers'); if (e.length === 0)
        return A.alloc(0); let r; if (t === void 0)
        for (t = 0, r = 0; r < e.length; ++r)
            t += e[r].length; let n = A.allocUnsafe(t), i = 0; for (r = 0; r < e.length; ++r) {
        let o = e[r];
        if (fe(o, Uint8Array))
            i + o.length > n.length ? (A.isBuffer(o) || (o = A.from(o)), o.copy(n, i)) : Uint8Array.prototype.set.call(n, o, i);
        else if (A.isBuffer(o))
            o.copy(n, i);
        else
            throw new TypeError('"list" argument must be an Array of Buffers');
        i += o.length;
    } return n; };
    function Ei(e, t) { if (A.isBuffer(e))
        return e.length; if (ArrayBuffer.isView(e) || fe(e, ArrayBuffer))
        return e.byteLength; if (typeof e != "string")
        throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof e); let r = e.length, n = arguments.length > 2 && arguments[2] === !0; if (!n && r === 0)
        return 0; let i = !1; for (;;)
        switch (t) {
            case "ascii":
            case "latin1":
            case "binary": return r;
            case "utf8":
            case "utf-8": return dn(e).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le": return r * 2;
            case "hex": return r >>> 1;
            case "base64": return Si(e).length;
            default:
                if (i)
                    return n ? -1 : dn(e).length;
                t = ("" + t).toLowerCase(), i = !0;
        } }
    A.byteLength = Ei;
    function La(e, t, r) { let n = !1; if ((t === void 0 || t < 0) && (t = 0), t > this.length || ((r === void 0 || r > this.length) && (r = this.length), r <= 0) || (r >>>= 0, t >>>= 0, r <= t))
        return ""; for (e || (e = "utf8");;)
        switch (e) {
            case "hex": return Wa(this, t, r);
            case "utf8":
            case "utf-8": return xi(this, t, r);
            case "ascii": return Qa(this, t, r);
            case "latin1":
            case "binary": return Ja(this, t, r);
            case "base64": return ja(this, t, r);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le": return Ka(this, t, r);
            default:
                if (n)
                    throw new TypeError("Unknown encoding: " + e);
                e = (e + "").toLowerCase(), n = !0;
        } }
    A.prototype._isBuffer = !0;
    function Be(e, t, r) { let n = e[t]; e[t] = e[r], e[r] = n; }
    A.prototype.swap16 = function () { let e = this.length; if (e % 2 !== 0)
        throw new RangeError("Buffer size must be a multiple of 16-bits"); for (let t = 0; t < e; t += 2)
        Be(this, t, t + 1); return this; };
    A.prototype.swap32 = function () { let e = this.length; if (e % 4 !== 0)
        throw new RangeError("Buffer size must be a multiple of 32-bits"); for (let t = 0; t < e; t += 4)
        Be(this, t, t + 3), Be(this, t + 1, t + 2); return this; };
    A.prototype.swap64 = function () { let e = this.length; if (e % 8 !== 0)
        throw new RangeError("Buffer size must be a multiple of 64-bits"); for (let t = 0; t < e; t += 8)
        Be(this, t, t + 7), Be(this, t + 1, t + 6), Be(this, t + 2, t + 5), Be(this, t + 3, t + 4); return this; };
    A.prototype.toString = function () { let e = this.length; return e === 0 ? "" : arguments.length === 0 ? xi(this, 0, e) : La.apply(this, arguments); };
    A.prototype.toLocaleString = A.prototype.toString;
    A.prototype.equals = function (e) { if (!A.isBuffer(e))
        throw new TypeError("Argument must be a Buffer"); return this === e ? !0 : A.compare(this, e) === 0; };
    A.prototype.inspect = function () { let e = "", t = ze.INSPECT_MAX_BYTES; return e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim(), this.length > t && (e += " ... "), "<Buffer " + e + ">"; };
    pi && (A.prototype[pi] = A.prototype.inspect);
    A.prototype.compare = function (e, t, r, n, i) { if (fe(e, Uint8Array) && (e = A.from(e, e.offset, e.byteLength)), !A.isBuffer(e))
        throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e); if (t === void 0 && (t = 0), r === void 0 && (r = e ? e.length : 0), n === void 0 && (n = 0), i === void 0 && (i = this.length), t < 0 || r > e.length || n < 0 || i > this.length)
        throw new RangeError("out of range index"); if (n >= i && t >= r)
        return 0; if (n >= i)
        return -1; if (t >= r)
        return 1; if (t >>>= 0, r >>>= 0, n >>>= 0, i >>>= 0, this === e)
        return 0; let o = i - n, s = r - t, a = Math.min(o, s), l = this.slice(n, i), f = e.slice(t, r); for (let g = 0; g < a; ++g)
        if (l[g] !== f[g]) {
            o = l[g], s = f[g];
            break;
        } return o < s ? -1 : s < o ? 1 : 0; };
    function bi(e, t, r, n, i) { if (e.length === 0)
        return -1; if (typeof r == "string" ? (n = r, r = 0) : r > 2147483647 ? r = 2147483647 : r < -2147483648 && (r = -2147483648), r = +r, yn(r) && (r = i ? 0 : e.length - 1), r < 0 && (r = e.length + r), r >= e.length) {
        if (i)
            return -1;
        r = e.length - 1;
    }
    else if (r < 0)
        if (i)
            r = 0;
        else
            return -1; if (typeof t == "string" && (t = A.from(t, n)), A.isBuffer(t))
        return t.length === 0 ? -1 : mi(e, t, r, n, i); if (typeof t == "number")
        return t = t & 255, typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(e, t, r) : Uint8Array.prototype.lastIndexOf.call(e, t, r) : mi(e, [t], r, n, i); throw new TypeError("val must be string, number or Buffer"); }
    function mi(e, t, r, n, i) { let o = 1, s = e.length, a = t.length; if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
        if (e.length < 2 || t.length < 2)
            return -1;
        o = 2, s /= 2, a /= 2, r /= 2;
    } function l(g, h) { return o === 1 ? g[h] : g.readUInt16BE(h * o); } let f; if (i) {
        let g = -1;
        for (f = r; f < s; f++)
            if (l(e, f) === l(t, g === -1 ? 0 : f - g)) {
                if (g === -1 && (g = f), f - g + 1 === a)
                    return g * o;
            }
            else
                g !== -1 && (f -= f - g), g = -1;
    }
    else
        for (r + a > s && (r = s - a), f = r; f >= 0; f--) {
            let g = !0;
            for (let h = 0; h < a; h++)
                if (l(e, f + h) !== l(t, h)) {
                    g = !1;
                    break;
                }
            if (g)
                return f;
        } return -1; }
    A.prototype.includes = function (e, t, r) { return this.indexOf(e, t, r) !== -1; };
    A.prototype.indexOf = function (e, t, r) { return bi(this, e, t, r, !0); };
    A.prototype.lastIndexOf = function (e, t, r) { return bi(this, e, t, r, !1); };
    function Ua(e, t, r, n) { r = Number(r) || 0; let i = e.length - r; n ? (n = Number(n), n > i && (n = i)) : n = i; let o = t.length; n > o / 2 && (n = o / 2); let s; for (s = 0; s < n; ++s) {
        let a = parseInt(t.substr(s * 2, 2), 16);
        if (yn(a))
            return s;
        e[r + s] = a;
    } return s; }
    function Ba(e, t, r, n) { return pr(dn(t, e.length - r), e, r, n); }
    function qa(e, t, r, n) { return pr(Za(t), e, r, n); }
    function $a(e, t, r, n) { return pr(Si(t), e, r, n); }
    function Va(e, t, r, n) { return pr(Xa(t, e.length - r), e, r, n); }
    A.prototype.write = function (e, t, r, n) { if (t === void 0)
        n = "utf8", r = this.length, t = 0;
    else if (r === void 0 && typeof t == "string")
        n = t, r = this.length, t = 0;
    else if (isFinite(t))
        t = t >>> 0, isFinite(r) ? (r = r >>> 0, n === void 0 && (n = "utf8")) : (n = r, r = void 0);
    else
        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported"); let i = this.length - t; if ((r === void 0 || r > i) && (r = i), e.length > 0 && (r < 0 || t < 0) || t > this.length)
        throw new RangeError("Attempt to write outside buffer bounds"); n || (n = "utf8"); let o = !1; for (;;)
        switch (n) {
            case "hex": return Ua(this, e, t, r);
            case "utf8":
            case "utf-8": return Ba(this, e, t, r);
            case "ascii":
            case "latin1":
            case "binary": return qa(this, e, t, r);
            case "base64": return $a(this, e, t, r);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le": return Va(this, e, t, r);
            default:
                if (o)
                    throw new TypeError("Unknown encoding: " + n);
                n = ("" + n).toLowerCase(), o = !0;
        } };
    A.prototype.toJSON = function () { return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) }; };
    function ja(e, t, r) { return t === 0 && r === e.length ? pn.fromByteArray(e) : pn.fromByteArray(e.slice(t, r)); }
    function xi(e, t, r) { r = Math.min(e.length, r); let n = [], i = t; for (; i < r;) {
        let o = e[i], s = null, a = o > 239 ? 4 : o > 223 ? 3 : o > 191 ? 2 : 1;
        if (i + a <= r) {
            let l, f, g, h;
            switch (a) {
                case 1:
                    o < 128 && (s = o);
                    break;
                case 2:
                    l = e[i + 1], (l & 192) === 128 && (h = (o & 31) << 6 | l & 63, h > 127 && (s = h));
                    break;
                case 3:
                    l = e[i + 1], f = e[i + 2], (l & 192) === 128 && (f & 192) === 128 && (h = (o & 15) << 12 | (l & 63) << 6 | f & 63, h > 2047 && (h < 55296 || h > 57343) && (s = h));
                    break;
                case 4: l = e[i + 1], f = e[i + 2], g = e[i + 3], (l & 192) === 128 && (f & 192) === 128 && (g & 192) === 128 && (h = (o & 15) << 18 | (l & 63) << 12 | (f & 63) << 6 | g & 63, h > 65535 && h < 1114112 && (s = h));
            }
        }
        s === null ? (s = 65533, a = 1) : s > 65535 && (s -= 65536, n.push(s >>> 10 & 1023 | 55296), s = 56320 | s & 1023), n.push(s), i += a;
    } return Ga(n); }
    var di = 4096;
    function Ga(e) { let t = e.length; if (t <= di)
        return String.fromCharCode.apply(String, e); let r = "", n = 0; for (; n < t;)
        r += String.fromCharCode.apply(String, e.slice(n, n += di)); return r; }
    function Qa(e, t, r) { let n = ""; r = Math.min(e.length, r); for (let i = t; i < r; ++i)
        n += String.fromCharCode(e[i] & 127); return n; }
    function Ja(e, t, r) { let n = ""; r = Math.min(e.length, r); for (let i = t; i < r; ++i)
        n += String.fromCharCode(e[i]); return n; }
    function Wa(e, t, r) { let n = e.length; (!t || t < 0) && (t = 0), (!r || r < 0 || r > n) && (r = n); let i = ""; for (let o = t; o < r; ++o)
        i += el[e[o]]; return i; }
    function Ka(e, t, r) { let n = e.slice(t, r), i = ""; for (let o = 0; o < n.length - 1; o += 2)
        i += String.fromCharCode(n[o] + n[o + 1] * 256); return i; }
    A.prototype.slice = function (e, t) { let r = this.length; e = ~~e, t = t === void 0 ? r : ~~t, e < 0 ? (e += r, e < 0 && (e = 0)) : e > r && (e = r), t < 0 ? (t += r, t < 0 && (t = 0)) : t > r && (t = r), t < e && (t = e); let n = this.subarray(e, t); return Object.setPrototypeOf(n, A.prototype), n; };
    function K(e, t, r) { if (e % 1 !== 0 || e < 0)
        throw new RangeError("offset is not uint"); if (e + t > r)
        throw new RangeError("Trying to access beyond buffer length"); }
    A.prototype.readUintLE = A.prototype.readUIntLE = function (e, t, r) { e = e >>> 0, t = t >>> 0, r || K(e, t, this.length); let n = this[e], i = 1, o = 0; for (; ++o < t && (i *= 256);)
        n += this[e + o] * i; return n; };
    A.prototype.readUintBE = A.prototype.readUIntBE = function (e, t, r) { e = e >>> 0, t = t >>> 0, r || K(e, t, this.length); let n = this[e + --t], i = 1; for (; t > 0 && (i *= 256);)
        n += this[e + --t] * i; return n; };
    A.prototype.readUint8 = A.prototype.readUInt8 = function (e, t) { return e = e >>> 0, t || K(e, 1, this.length), this[e]; };
    A.prototype.readUint16LE = A.prototype.readUInt16LE = function (e, t) { return e = e >>> 0, t || K(e, 2, this.length), this[e] | this[e + 1] << 8; };
    A.prototype.readUint16BE = A.prototype.readUInt16BE = function (e, t) { return e = e >>> 0, t || K(e, 2, this.length), this[e] << 8 | this[e + 1]; };
    A.prototype.readUint32LE = A.prototype.readUInt32LE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216; };
    A.prototype.readUint32BE = A.prototype.readUInt32BE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]); };
    A.prototype.readBigUInt64LE = ke(function (e) { e = e >>> 0, He(e, "offset"); let t = this[e], r = this[e + 7]; (t === void 0 || r === void 0) && At(e, this.length - 8); let n = t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24, i = this[++e] + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + r * 2 ** 24; return BigInt(n) + (BigInt(i) << BigInt(32)); });
    A.prototype.readBigUInt64BE = ke(function (e) { e = e >>> 0, He(e, "offset"); let t = this[e], r = this[e + 7]; (t === void 0 || r === void 0) && At(e, this.length - 8); let n = t * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e], i = this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + r; return (BigInt(n) << BigInt(32)) + BigInt(i); });
    A.prototype.readIntLE = function (e, t, r) { e = e >>> 0, t = t >>> 0, r || K(e, t, this.length); let n = this[e], i = 1, o = 0; for (; ++o < t && (i *= 256);)
        n += this[e + o] * i; return i *= 128, n >= i && (n -= Math.pow(2, 8 * t)), n; };
    A.prototype.readIntBE = function (e, t, r) { e = e >>> 0, t = t >>> 0, r || K(e, t, this.length); let n = t, i = 1, o = this[e + --n]; for (; n > 0 && (i *= 256);)
        o += this[e + --n] * i; return i *= 128, o >= i && (o -= Math.pow(2, 8 * t)), o; };
    A.prototype.readInt8 = function (e, t) { return e = e >>> 0, t || K(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e]; };
    A.prototype.readInt16LE = function (e, t) { e = e >>> 0, t || K(e, 2, this.length); let r = this[e] | this[e + 1] << 8; return r & 32768 ? r | 4294901760 : r; };
    A.prototype.readInt16BE = function (e, t) { e = e >>> 0, t || K(e, 2, this.length); let r = this[e + 1] | this[e] << 8; return r & 32768 ? r | 4294901760 : r; };
    A.prototype.readInt32LE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24; };
    A.prototype.readInt32BE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]; };
    A.prototype.readBigInt64LE = ke(function (e) { e = e >>> 0, He(e, "offset"); let t = this[e], r = this[e + 7]; (t === void 0 || r === void 0) && At(e, this.length - 8); let n = this[e + 4] + this[e + 5] * 2 ** 8 + this[e + 6] * 2 ** 16 + (r << 24); return (BigInt(n) << BigInt(32)) + BigInt(t + this[++e] * 2 ** 8 + this[++e] * 2 ** 16 + this[++e] * 2 ** 24); });
    A.prototype.readBigInt64BE = ke(function (e) { e = e >>> 0, He(e, "offset"); let t = this[e], r = this[e + 7]; (t === void 0 || r === void 0) && At(e, this.length - 8); let n = (t << 24) + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + this[++e]; return (BigInt(n) << BigInt(32)) + BigInt(this[++e] * 2 ** 24 + this[++e] * 2 ** 16 + this[++e] * 2 ** 8 + r); });
    A.prototype.readFloatLE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), Ke.read(this, e, !0, 23, 4); };
    A.prototype.readFloatBE = function (e, t) { return e = e >>> 0, t || K(e, 4, this.length), Ke.read(this, e, !1, 23, 4); };
    A.prototype.readDoubleLE = function (e, t) { return e = e >>> 0, t || K(e, 8, this.length), Ke.read(this, e, !0, 52, 8); };
    A.prototype.readDoubleBE = function (e, t) { return e = e >>> 0, t || K(e, 8, this.length), Ke.read(this, e, !1, 52, 8); };
    function re(e, t, r, n, i, o) { if (!A.isBuffer(e))
        throw new TypeError('"buffer" argument must be a Buffer instance'); if (t > i || t < o)
        throw new RangeError('"value" argument is out of bounds'); if (r + n > e.length)
        throw new RangeError("Index out of range"); }
    A.prototype.writeUintLE = A.prototype.writeUIntLE = function (e, t, r, n) { if (e = +e, t = t >>> 0, r = r >>> 0, !n) {
        let s = Math.pow(2, 8 * r) - 1;
        re(this, e, t, r, s, 0);
    } let i = 1, o = 0; for (this[t] = e & 255; ++o < r && (i *= 256);)
        this[t + o] = e / i & 255; return t + r; };
    A.prototype.writeUintBE = A.prototype.writeUIntBE = function (e, t, r, n) { if (e = +e, t = t >>> 0, r = r >>> 0, !n) {
        let s = Math.pow(2, 8 * r) - 1;
        re(this, e, t, r, s, 0);
    } let i = r - 1, o = 1; for (this[t + i] = e & 255; --i >= 0 && (o *= 256);)
        this[t + i] = e / o & 255; return t + r; };
    A.prototype.writeUint8 = A.prototype.writeUInt8 = function (e, t, r) { return e = +e, t = t >>> 0, r || re(this, e, t, 1, 255, 0), this[t] = e & 255, t + 1; };
    A.prototype.writeUint16LE = A.prototype.writeUInt16LE = function (e, t, r) { return e = +e, t = t >>> 0, r || re(this, e, t, 2, 65535, 0), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2; };
    A.prototype.writeUint16BE = A.prototype.writeUInt16BE = function (e, t, r) { return e = +e, t = t >>> 0, r || re(this, e, t, 2, 65535, 0), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2; };
    A.prototype.writeUint32LE = A.prototype.writeUInt32LE = function (e, t, r) { return e = +e, t = t >>> 0, r || re(this, e, t, 4, 4294967295, 0), this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255, t + 4; };
    A.prototype.writeUint32BE = A.prototype.writeUInt32BE = function (e, t, r) { return e = +e, t = t >>> 0, r || re(this, e, t, 4, 4294967295, 0), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4; };
    function Pi(e, t, r, n, i) { Ri(t, n, i, e, r, 7); let o = Number(t & BigInt(4294967295)); e[r++] = o, o = o >> 8, e[r++] = o, o = o >> 8, e[r++] = o, o = o >> 8, e[r++] = o; let s = Number(t >> BigInt(32) & BigInt(4294967295)); return e[r++] = s, s = s >> 8, e[r++] = s, s = s >> 8, e[r++] = s, s = s >> 8, e[r++] = s, r; }
    function vi(e, t, r, n, i) { Ri(t, n, i, e, r, 7); let o = Number(t & BigInt(4294967295)); e[r + 7] = o, o = o >> 8, e[r + 6] = o, o = o >> 8, e[r + 5] = o, o = o >> 8, e[r + 4] = o; let s = Number(t >> BigInt(32) & BigInt(4294967295)); return e[r + 3] = s, s = s >> 8, e[r + 2] = s, s = s >> 8, e[r + 1] = s, s = s >> 8, e[r] = s, r + 8; }
    A.prototype.writeBigUInt64LE = ke(function (e, t = 0) { return Pi(this, e, t, BigInt(0), BigInt("0xffffffffffffffff")); });
    A.prototype.writeBigUInt64BE = ke(function (e, t = 0) { return vi(this, e, t, BigInt(0), BigInt("0xffffffffffffffff")); });
    A.prototype.writeIntLE = function (e, t, r, n) { if (e = +e, t = t >>> 0, !n) {
        let a = Math.pow(2, 8 * r - 1);
        re(this, e, t, r, a - 1, -a);
    } let i = 0, o = 1, s = 0; for (this[t] = e & 255; ++i < r && (o *= 256);)
        e < 0 && s === 0 && this[t + i - 1] !== 0 && (s = 1), this[t + i] = (e / o >> 0) - s & 255; return t + r; };
    A.prototype.writeIntBE = function (e, t, r, n) { if (e = +e, t = t >>> 0, !n) {
        let a = Math.pow(2, 8 * r - 1);
        re(this, e, t, r, a - 1, -a);
    } let i = r - 1, o = 1, s = 0; for (this[t + i] = e & 255; --i >= 0 && (o *= 256);)
        e < 0 && s === 0 && this[t + i + 1] !== 0 && (s = 1), this[t + i] = (e / o >> 0) - s & 255; return t + r; };
    A.prototype.writeInt8 = function (e, t, r) { return e = +e, t = t >>> 0, r || re(this, e, t, 1, 127, -128), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1; };
    A.prototype.writeInt16LE = function (e, t, r) { return e = +e, t = t >>> 0, r || re(this, e, t, 2, 32767, -32768), this[t] = e & 255, this[t + 1] = e >>> 8, t + 2; };
    A.prototype.writeInt16BE = function (e, t, r) { return e = +e, t = t >>> 0, r || re(this, e, t, 2, 32767, -32768), this[t] = e >>> 8, this[t + 1] = e & 255, t + 2; };
    A.prototype.writeInt32LE = function (e, t, r) { return e = +e, t = t >>> 0, r || re(this, e, t, 4, 2147483647, -2147483648), this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24, t + 4; };
    A.prototype.writeInt32BE = function (e, t, r) { return e = +e, t = t >>> 0, r || re(this, e, t, 4, 2147483647, -2147483648), e < 0 && (e = 4294967295 + e + 1), this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255, t + 4; };
    A.prototype.writeBigInt64LE = ke(function (e, t = 0) { return Pi(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff")); });
    A.prototype.writeBigInt64BE = ke(function (e, t = 0) { return vi(this, e, t, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff")); });
    function Ti(e, t, r, n, i, o) { if (r + n > e.length)
        throw new RangeError("Index out of range"); if (r < 0)
        throw new RangeError("Index out of range"); }
    function Ai(e, t, r, n, i) { return t = +t, r = r >>> 0, i || Ti(e, t, r, 4, 34028234663852886e22, -34028234663852886e22), Ke.write(e, t, r, n, 23, 4), r + 4; }
    A.prototype.writeFloatLE = function (e, t, r) { return Ai(this, e, t, !0, r); };
    A.prototype.writeFloatBE = function (e, t, r) { return Ai(this, e, t, !1, r); };
    function Ci(e, t, r, n, i) { return t = +t, r = r >>> 0, i || Ti(e, t, r, 8, 17976931348623157e292, -17976931348623157e292), Ke.write(e, t, r, n, 52, 8), r + 8; }
    A.prototype.writeDoubleLE = function (e, t, r) { return Ci(this, e, t, !0, r); };
    A.prototype.writeDoubleBE = function (e, t, r) { return Ci(this, e, t, !1, r); };
    A.prototype.copy = function (e, t, r, n) { if (!A.isBuffer(e))
        throw new TypeError("argument should be a Buffer"); if (r || (r = 0), !n && n !== 0 && (n = this.length), t >= e.length && (t = e.length), t || (t = 0), n > 0 && n < r && (n = r), n === r || e.length === 0 || this.length === 0)
        return 0; if (t < 0)
        throw new RangeError("targetStart out of bounds"); if (r < 0 || r >= this.length)
        throw new RangeError("Index out of range"); if (n < 0)
        throw new RangeError("sourceEnd out of bounds"); n > this.length && (n = this.length), e.length - t < n - r && (n = e.length - t + r); let i = n - r; return this === e && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(t, r, n) : Uint8Array.prototype.set.call(e, this.subarray(r, n), t), i; };
    A.prototype.fill = function (e, t, r, n) { if (typeof e == "string") {
        if (typeof t == "string" ? (n = t, t = 0, r = this.length) : typeof r == "string" && (n = r, r = this.length), n !== void 0 && typeof n != "string")
            throw new TypeError("encoding must be a string");
        if (typeof n == "string" && !A.isEncoding(n))
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
        let o = A.isBuffer(e) ? e : A.from(e, n), s = o.length;
        if (s === 0)
            throw new TypeError('The value "' + e + '" is invalid for argument "value"');
        for (i = 0; i < r - t; ++i)
            this[i + t] = o[i % s];
    } return this; };
    var We = {};
    function hn(e, t, r) { We[e] = class extends r {
        constructor() { super(), Object.defineProperty(this, "message", { value: t.apply(this, arguments), writable: !0, configurable: !0 }), this.name = `${this.name} [${e}]`, this.stack, delete this.name; }
        get code() { return e; }
        set code(n) { Object.defineProperty(this, "code", { configurable: !0, enumerable: !0, value: n, writable: !0 }); }
        toString() { return `${this.name} [${e}]: ${this.message}`; }
    }; }
    hn("ERR_BUFFER_OUT_OF_BOUNDS", function (e) { return e ? `${e} is outside of buffer bounds` : "Attempt to access memory outside buffer bounds"; }, RangeError);
    hn("ERR_INVALID_ARG_TYPE", function (e, t) { return `The "${e}" argument must be of type number. Received type ${typeof t}`; }, TypeError);
    hn("ERR_OUT_OF_RANGE", function (e, t, r) { let n = `The value of "${e}" is out of range.`, i = r; return Number.isInteger(r) && Math.abs(r) > 2 ** 32 ? i = fi(String(r)) : typeof r == "bigint" && (i = String(r), (r > BigInt(2) ** BigInt(32) || r < -(BigInt(2) ** BigInt(32))) && (i = fi(i)), i += "n"), n += ` It must be ${t}. Received ${i}`, n; }, RangeError);
    function fi(e) { let t = "", r = e.length, n = e[0] === "-" ? 1 : 0; for (; r >= n + 4; r -= 3)
        t = `_${e.slice(r - 3, r)}${t}`; return `${e.slice(0, r)}${t}`; }
    function Ha(e, t, r) { He(t, "offset"), (e[t] === void 0 || e[t + r] === void 0) && At(t, e.length - (r + 1)); }
    function Ri(e, t, r, n, i, o) { if (e > r || e < t) {
        let s = typeof t == "bigint" ? "n" : "", a;
        throw o > 3 ? t === 0 || t === BigInt(0) ? a = `>= 0${s} and < 2${s} ** ${(o + 1) * 8}${s}` : a = `>= -(2${s} ** ${(o + 1) * 8 - 1}${s}) and < 2 ** ${(o + 1) * 8 - 1}${s}` : a = `>= ${t}${s} and <= ${r}${s}`, new We.ERR_OUT_OF_RANGE("value", a, e);
    } Ha(n, i, o); }
    function He(e, t) { if (typeof e != "number")
        throw new We.ERR_INVALID_ARG_TYPE(t, "number", e); }
    function At(e, t, r) { throw Math.floor(e) !== e ? (He(e, r), new We.ERR_OUT_OF_RANGE(r || "offset", "an integer", e)) : t < 0 ? new We.ERR_BUFFER_OUT_OF_BOUNDS : new We.ERR_OUT_OF_RANGE(r || "offset", `>= ${r ? 1 : 0} and <= ${t}`, e); }
    var za = /[^+/0-9A-Za-z-_]/g;
    function Ya(e) { if (e = e.split("=")[0], e = e.trim().replace(za, ""), e.length < 2)
        return ""; for (; e.length % 4 !== 0;)
        e = e + "="; return e; }
    function dn(e, t) { t = t || 1 / 0; let r, n = e.length, i = null, o = []; for (let s = 0; s < n; ++s) {
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
    function Za(e) { let t = []; for (let r = 0; r < e.length; ++r)
        t.push(e.charCodeAt(r) & 255); return t; }
    function Xa(e, t) { let r, n, i, o = []; for (let s = 0; s < e.length && !((t -= 2) < 0); ++s)
        r = e.charCodeAt(s), n = r >> 8, i = r % 256, o.push(i), o.push(n); return o; }
    function Si(e) { return pn.toByteArray(Ya(e)); }
    function pr(e, t, r, n) { let i; for (i = 0; i < n && !(i + r >= t.length || i >= e.length); ++i)
        t[i + r] = e[i]; return i; }
    function fe(e, t) { return e instanceof t || e != null && e.constructor != null && e.constructor.name != null && e.constructor.name === t.name; }
    function yn(e) { return e !== e; }
    var el = function () { let e = "0123456789abcdef", t = new Array(256); for (let r = 0; r < 16; ++r) {
        let n = r * 16;
        for (let i = 0; i < 16; ++i)
            t[n + i] = e[r] + e[i];
    } return t; }();
    function ke(e) { return typeof BigInt > "u" ? tl : e; }
    function tl() { throw new Error("BigInt not supported"); }
});
var w, d = de(() => {
    "use strict";
    w = Ue(ki());
});
function al() { return !1; }
function Pn() { return { dev: 0, ino: 0, mode: 0, nlink: 0, uid: 0, gid: 0, rdev: 0, size: 0, blksize: 0, blocks: 0, atimeMs: 0, mtimeMs: 0, ctimeMs: 0, birthtimeMs: 0, atime: new Date, mtime: new Date, ctime: new Date, birthtime: new Date }; }
function ll() { return Pn(); }
function ul() { return []; }
function cl(e) { e(null, []); }
function pl() { return ""; }
function ml() { return ""; }
function dl() { }
function fl() { }
function gl() { }
function hl() { }
function yl() { }
function wl() { }
function El() { }
function bl() { }
function xl() { return { close: () => { }, on: () => { }, removeAllListeners: () => { } }; }
function Pl(e, t) { t(null, Pn()); }
var vl, Tl, Ji, Wi = de(() => {
    "use strict";
    d();
    u();
    c();
    p();
    m();
    vl = {}, Tl = { existsSync: al, lstatSync: Pn, stat: Pl, statSync: ll, readdirSync: ul, readdir: cl, readlinkSync: pl, realpathSync: ml, chmodSync: dl, renameSync: fl, mkdirSync: gl, rmdirSync: hl, rmSync: yl, unlinkSync: wl, watchFile: El, unwatchFile: bl, watch: xl, promises: vl }, Ji = Tl;
});
function Al(...e) { return e.join("/"); }
function Cl(...e) { return e.join("/"); }
function Rl(e) { let t = Ki(e), r = Hi(e), [n, i] = t.split("."); return { root: "/", dir: r, base: t, ext: i, name: n }; }
function Ki(e) { let t = e.split("/"); return t[t.length - 1]; }
function Hi(e) { return e.split("/").slice(0, -1).join("/"); }
function kl(e) { let t = e.split("/").filter(i => i !== "" && i !== "."), r = []; for (let i of t)
    i === ".." ? r.pop() : r.push(i); let n = r.join("/"); return e.startsWith("/") ? "/" + n : n; }
var zi, Sl, Il, Ol, gr, Yi = de(() => {
    "use strict";
    d();
    u();
    c();
    p();
    m();
    zi = "/", Sl = ":";
    Il = { sep: zi }, Ol = { basename: Ki, delimiter: Sl, dirname: Hi, join: Cl, normalize: kl, parse: Rl, posix: Il, resolve: Al, sep: zi }, gr = Ol;
});
var Zi = Se((xd, Dl) => { Dl.exports = { name: "@prisma/internals", version: "6.13.0", description: "This package is intended for Prisma's internal use", main: "dist/index.js", types: "dist/index.d.ts", repository: { type: "git", url: "https://github.com/prisma/prisma.git", directory: "packages/internals" }, homepage: "https://www.prisma.io", author: "Tim Suchanek <suchanek@prisma.io>", bugs: "https://github.com/prisma/prisma/issues", license: "Apache-2.0", scripts: { dev: "DEV=true tsx helpers/build.ts", build: "tsx helpers/build.ts", test: "dotenv -e ../../.db.env -- jest --silent", prepublishOnly: "pnpm run build" }, files: ["README.md", "dist", "!**/libquery_engine*", "!dist/get-generators/engines/*", "scripts"], devDependencies: { "@babel/helper-validator-identifier": "7.25.9", "@opentelemetry/api": "1.9.0", "@swc/core": "1.11.5", "@swc/jest": "0.2.37", "@types/babel__helper-validator-identifier": "7.15.2", "@types/jest": "29.5.14", "@types/node": "18.19.76", "@types/resolve": "1.20.6", archiver: "6.0.2", "checkpoint-client": "1.1.33", "cli-truncate": "4.0.0", dotenv: "16.5.0", esbuild: "0.25.5", "escape-string-regexp": "5.0.0", execa: "5.1.1", "fast-glob": "3.3.3", "find-up": "7.0.0", "fp-ts": "2.16.9", "fs-extra": "11.3.0", "fs-jetpack": "5.1.0", "global-dirs": "4.0.0", globby: "11.1.0", "identifier-regex": "1.0.0", "indent-string": "4.0.0", "is-windows": "1.0.2", "is-wsl": "3.1.0", jest: "29.7.0", "jest-junit": "16.0.0", kleur: "4.1.5", "mock-stdin": "1.0.0", "new-github-issue-url": "0.2.1", "node-fetch": "3.3.2", "npm-packlist": "5.1.3", open: "7.4.2", "p-map": "4.0.0", "read-package-up": "11.0.0", resolve: "1.22.10", "string-width": "7.2.0", "strip-ansi": "6.0.1", "strip-indent": "4.0.0", "temp-dir": "2.0.0", tempy: "1.0.1", "terminal-link": "4.0.0", tmp: "0.2.3", "ts-node": "10.9.2", "ts-pattern": "5.6.2", "ts-toolbelt": "9.6.0", typescript: "5.4.5", yarn: "1.22.22" }, dependencies: { "@prisma/config": "workspace:*", "@prisma/debug": "workspace:*", "@prisma/dmmf": "workspace:*", "@prisma/driver-adapter-utils": "workspace:*", "@prisma/engines": "workspace:*", "@prisma/fetch-engine": "workspace:*", "@prisma/generator": "workspace:*", "@prisma/generator-helper": "workspace:*", "@prisma/get-platform": "workspace:*", "@prisma/prisma-schema-wasm": "6.13.0-35.361e86d0ea4987e9f53a565309b3eed797a6bcbd", "@prisma/schema-engine-wasm": "6.13.0-35.361e86d0ea4987e9f53a565309b3eed797a6bcbd", "@prisma/schema-files-loader": "workspace:*", arg: "5.0.2", prompts: "2.4.2" }, peerDependencies: { typescript: ">=5.1.0" }, peerDependenciesMeta: { typescript: { optional: !0 } }, sideEffects: !1 }; });
var Tn = Se((_d, Fl) => { Fl.exports = { name: "@prisma/engines-version", version: "6.13.0-35.361e86d0ea4987e9f53a565309b3eed797a6bcbd", main: "index.js", types: "index.d.ts", license: "Apache-2.0", author: "Tim Suchanek <suchanek@prisma.io>", prisma: { enginesVersion: "361e86d0ea4987e9f53a565309b3eed797a6bcbd" }, repository: { type: "git", url: "https://github.com/prisma/engines-wrapper.git", directory: "packages/engines-version" }, devDependencies: { "@types/node": "18.19.76", typescript: "4.9.5" }, files: ["index.js", "index.d.ts"], scripts: { build: "tsc -d" } }; });
var Xi = Se(hr => {
    "use strict";
    d();
    u();
    c();
    p();
    m();
    Object.defineProperty(hr, "__esModule", { value: !0 });
    hr.enginesVersion = void 0;
    hr.enginesVersion = Tn().prisma.enginesVersion;
});
var ro = Se((Wd, to) => {
    "use strict";
    d();
    u();
    c();
    p();
    m();
    to.exports = (e, t = 1, r) => { if (r = { indent: " ", includeEmptyLines: !1, ...r }, typeof e != "string")
        throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof e}\``); if (typeof t != "number")
        throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof t}\``); if (typeof r.indent != "string")
        throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof r.indent}\``); if (t === 0)
        return e; let n = r.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm; return e.replace(n, r.indent.repeat(t)); };
});
var oo = Se((sf, io) => {
    "use strict";
    d();
    u();
    c();
    p();
    m();
    io.exports = ({ onlyFirst: e = !1 } = {}) => { let t = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"].join("|"); return new RegExp(t, e ? void 0 : "g"); };
});
var ao = Se((mf, so) => {
    "use strict";
    d();
    u();
    c();
    p();
    m();
    var $l = oo();
    so.exports = e => typeof e == "string" ? e.replace($l(), "") : e;
});
var Nn = Se((ew, Ro) => {
    "use strict";
    d();
    u();
    c();
    p();
    m();
    Ro.exports = function () { function e(t, r, n, i, o) { return t < r || n < r ? t > n ? n + 1 : t + 1 : i === o ? r : r + 1; } return function (t, r) { if (t === r)
        return 0; if (t.length > r.length) {
        var n = t;
        t = r, r = n;
    } for (var i = t.length, o = r.length; i > 0 && t.charCodeAt(i - 1) === r.charCodeAt(o - 1);)
        i--, o--; for (var s = 0; s < i && t.charCodeAt(s) === r.charCodeAt(s);)
        s++; if (i -= s, o -= s, i === 0 || o < 3)
        return o; var a = 0, l, f, g, h, T, k, C, S, M, _, B, I, L = []; for (l = 0; l < i; l++)
        L.push(l + 1), L.push(t.charCodeAt(s + l)); for (var le = L.length - 1; a < o - 3;)
        for (M = r.charCodeAt(s + (f = a)), _ = r.charCodeAt(s + (g = a + 1)), B = r.charCodeAt(s + (h = a + 2)), I = r.charCodeAt(s + (T = a + 3)), k = a += 4, l = 0; l < le; l += 2)
            C = L[l], S = L[l + 1], f = e(C, f, g, M, S), g = e(f, g, h, _, S), h = e(g, h, T, B, S), k = e(h, T, k, I, S), L[l] = k, T = h, h = g, g = f, f = C; for (; a < o;)
        for (M = r.charCodeAt(s + (f = a)), k = ++a, l = 0; l < le; l += 2)
            C = L[l], L[l] = k = e(C, f, k, M, L[l + 1]), f = C; return k; }; }();
});
var Do = de(() => {
    "use strict";
    d();
    u();
    c();
    p();
    m();
});
var Mo = de(() => {
    "use strict";
    d();
    u();
    c();
    p();
    m();
});
var Qr, ns = de(() => {
    "use strict";
    d();
    u();
    c();
    p();
    m();
    Qr = class {
        constructor() {
            this.events = {};
        }
        on(t, r) { return this.events[t] || (this.events[t] = []), this.events[t].push(r), this; }
        emit(t, ...r) { return this.events[t] ? (this.events[t].forEach(n => { n(...r); }), !0) : !1; }
    };
});
var Mp = {};
Tt(Mp, { DMMF: () => Mt, Debug: () => z, Decimal: () => ye, Extensions: () => wn, MetricsClient: () => dt, PrismaClientInitializationError: () => J, PrismaClientKnownRequestError: () => ne, PrismaClientRustPanicError: () => Te, PrismaClientUnknownRequestError: () => ie, PrismaClientValidationError: () => X, Public: () => En, Sql: () => se, createParam: () => Ho, defineDmmfProperty: () => ts, deserializeJsonResponse: () => rt, deserializeRawResult: () => sn, dmmfToRuntimeDataModel: () => Co, empty: () => os, getPrismaClient: () => ba, getRuntime: () => Zr, join: () => is, makeStrictEnum: () => xa, makeTypedQueryFactory: () => rs, objectEnumValues: () => Nr, raw: () => Gn, serializeJsonQuery: () => Vr, skip: () => $r, sqltag: () => Qn, warnEnvConflicts: () => void 0, warnOnce: () => kt });
module.exports = Sa(Mp);
d();
u();
c();
p();
m();
var wn = {};
Tt(wn, { defineExtension: () => Ii, getExtensionContext: () => Oi });
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
function Ii(e) { return typeof e == "function" ? e : t => t.$extends(e); }
d();
u();
c();
p();
m();
function Oi(e) { return e; }
var En = {};
Tt(En, { validator: () => Di });
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
function Di(...e) { return t => t; }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var bn, Mi, _i, Ni, Fi = !0;
typeof y < "u" && ({ FORCE_COLOR: bn, NODE_DISABLE_COLORS: Mi, NO_COLOR: _i, TERM: Ni } = y.env || {}, Fi = y.stdout && y.stdout.isTTY);
var rl = { enabled: !Mi && _i == null && Ni !== "dumb" && (bn != null && bn !== "0" || Fi) };
function j(e, t) { let r = new RegExp(`\\x1b\\[${t}m`, "g"), n = `\x1B[${e}m`, i = `\x1B[${t}m`; return function (o) { return !rl.enabled || o == null ? o : n + (~("" + o).indexOf(i) ? o.replace(r, i + n) : o) + i; }; }
var Tm = j(0, 0), mr = j(1, 22), dr = j(2, 22), Am = j(3, 23), Li = j(4, 24), Cm = j(7, 27), Rm = j(8, 28), Sm = j(9, 29), km = j(30, 39), Ye = j(31, 39), Ui = j(32, 39), Bi = j(33, 39), qi = j(34, 39), Im = j(35, 39), $i = j(36, 39), Om = j(37, 39), Vi = j(90, 39), Dm = j(90, 39), Mm = j(40, 49), _m = j(41, 49), Nm = j(42, 49), Fm = j(43, 49), Lm = j(44, 49), Um = j(45, 49), Bm = j(46, 49), qm = j(47, 49);
d();
u();
c();
p();
m();
var nl = 100, ji = ["green", "yellow", "blue", "magenta", "cyan", "red"], fr = [], Gi = Date.now(), il = 0, xn = typeof y < "u" ? y.env : {};
globalThis.DEBUG ?? (globalThis.DEBUG = xn.DEBUG ?? "");
globalThis.DEBUG_COLORS ?? (globalThis.DEBUG_COLORS = xn.DEBUG_COLORS ? xn.DEBUG_COLORS === "true" : !0);
var Ct = { enable(e) { typeof e == "string" && (globalThis.DEBUG = e); }, disable() { let e = globalThis.DEBUG; return globalThis.DEBUG = "", e; }, enabled(e) { let t = globalThis.DEBUG.split(",").map(i => i.replace(/[.+?^${}()|[\]\\]/g, "\\$&")), r = t.some(i => i === "" || i[0] === "-" ? !1 : e.match(RegExp(i.split("*").join(".*") + "$"))), n = t.some(i => i === "" || i[0] !== "-" ? !1 : e.match(RegExp(i.slice(1).split("*").join(".*") + "$"))); return r && !n; }, log: (...e) => { let [t, r, ...n] = e; (console.warn ?? console.log)(`${t} ${r}`, ...n); }, formatters: {} };
function ol(e) { let t = { color: ji[il++ % ji.length], enabled: Ct.enabled(e), namespace: e, log: Ct.log, extend: () => { } }, r = (...n) => { let { enabled: i, namespace: o, color: s, log: a } = t; if (n.length !== 0 && fr.push([o, ...n]), fr.length > nl && fr.shift(), Ct.enabled(o) || i) {
    let l = n.map(g => typeof g == "string" ? g : sl(g)), f = `+${Date.now() - Gi}ms`;
    Gi = Date.now(), a(o, ...l, f);
} }; return new Proxy(r, { get: (n, i) => t[i], set: (n, i, o) => t[i] = o }); }
var z = new Proxy(ol, { get: (e, t) => Ct[t], set: (e, t, r) => Ct[t] = r });
function sl(e, t = 2) { let r = new Set; return JSON.stringify(e, (n, i) => { if (typeof i == "object" && i !== null) {
    if (r.has(i))
        return "[Circular *]";
    r.add(i);
}
else if (typeof i == "bigint")
    return i.toString(); return i; }, t); }
function Qi() { fr.length = 0; }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var Ml = Zi(), vn = Ml.version;
d();
u();
c();
p();
m();
function Ze(e) { let t = _l(); return t || (e?.config.engineType === "library" ? "library" : e?.config.engineType === "binary" ? "binary" : e?.config.engineType === "client" ? "client" : Nl(e)); }
function _l() { let e = y.env.PRISMA_CLIENT_ENGINE_TYPE; return e === "library" ? "library" : e === "binary" ? "binary" : e === "client" ? "client" : void 0; }
function Nl(e) { return e?.previewFeatures.includes("queryCompiler") ? "client" : "library"; }
d();
u();
c();
p();
m();
var eo = "prisma+postgres", yr = `${eo}:`;
function wr(e) { return e?.toString().startsWith(`${yr}//`) ?? !1; }
function An(e) { if (!wr(e))
    return !1; let { host: t } = new URL(e); return t.includes("localhost") || t.includes("127.0.0.1") || t.includes("[::1]"); }
var St = {};
Tt(St, { error: () => Bl, info: () => Ul, log: () => Ll, query: () => ql, should: () => no, tags: () => Rt, warn: () => Cn });
d();
u();
c();
p();
m();
var Rt = { error: Ye("prisma:error"), warn: Bi("prisma:warn"), info: $i("prisma:info"), query: qi("prisma:query") }, no = { warn: () => !y.env.PRISMA_DISABLE_WARNINGS };
function Ll(...e) { console.log(...e); }
function Cn(e, ...t) { no.warn() && console.warn(`${Rt.warn} ${e}`, ...t); }
function Ul(e, ...t) { console.info(`${Rt.info} ${e}`, ...t); }
function Bl(e, ...t) { console.error(`${Rt.error} ${e}`, ...t); }
function ql(e, ...t) { console.log(`${Rt.query} ${e}`, ...t); }
d();
u();
c();
p();
m();
function ve(e, t) { throw new Error(t); }
d();
u();
c();
p();
m();
function Rn(e, t) { return Object.prototype.hasOwnProperty.call(e, t); }
d();
u();
c();
p();
m();
function Xe(e, t) { let r = {}; for (let n of Object.keys(e))
    r[n] = t(e[n], n); return r; }
d();
u();
c();
p();
m();
function Sn(e, t) { if (e.length === 0)
    return; let r = e[0]; for (let n = 1; n < e.length; n++)
    t(r, e[n]) < 0 && (r = e[n]); return r; }
d();
u();
c();
p();
m();
function F(e, t) { Object.defineProperty(e, "name", { value: t, configurable: !0 }); }
d();
u();
c();
p();
m();
var lo = new Set, kt = (e, t, ...r) => { lo.has(e) || (lo.add(e), Cn(t, ...r)); };
var J = class e extends Error {
    constructor(t, r, n) { super(t), this.name = "PrismaClientInitializationError", this.clientVersion = r, this.errorCode = n, Error.captureStackTrace(e); }
    get [Symbol.toStringTag]() { return "PrismaClientInitializationError"; }
};
F(J, "PrismaClientInitializationError");
d();
u();
c();
p();
m();
var ne = class extends Error {
    constructor(t, { code: r, clientVersion: n, meta: i, batchRequestIdx: o }) { super(t), this.name = "PrismaClientKnownRequestError", this.code = r, this.clientVersion = n, this.meta = i, Object.defineProperty(this, "batchRequestIdx", { value: o, enumerable: !1, writable: !0 }); }
    get [Symbol.toStringTag]() { return "PrismaClientKnownRequestError"; }
};
F(ne, "PrismaClientKnownRequestError");
d();
u();
c();
p();
m();
var Te = class extends Error {
    constructor(t, r) { super(t), this.name = "PrismaClientRustPanicError", this.clientVersion = r; }
    get [Symbol.toStringTag]() { return "PrismaClientRustPanicError"; }
};
F(Te, "PrismaClientRustPanicError");
d();
u();
c();
p();
m();
var ie = class extends Error {
    constructor(t, { clientVersion: r, batchRequestIdx: n }) { super(t), this.name = "PrismaClientUnknownRequestError", this.clientVersion = r, Object.defineProperty(this, "batchRequestIdx", { value: n, writable: !0, enumerable: !1 }); }
    get [Symbol.toStringTag]() { return "PrismaClientUnknownRequestError"; }
};
F(ie, "PrismaClientUnknownRequestError");
d();
u();
c();
p();
m();
var X = class extends Error {
    constructor(t, { clientVersion: r }) {
        this.name = "PrismaClientValidationError";
        super(t), this.clientVersion = r;
    }
    get [Symbol.toStringTag]() { return "PrismaClientValidationError"; }
};
F(X, "PrismaClientValidationError");
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var et = 9e15, Me = 1e9, kn = "0123456789abcdef", xr = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058", Pr = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789", In = { precision: 20, rounding: 4, modulo: 1, toExpNeg: -7, toExpPos: 21, minE: -et, maxE: et, crypto: !1 }, fo, Ae, N = !0, Tr = "[DecimalError] ", De = Tr + "Invalid argument: ", go = Tr + "Precision limit exceeded", ho = Tr + "crypto unavailable", yo = "[object Decimal]", ee = Math.floor, W = Math.pow, Vl = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i, jl = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i, Gl = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i, wo = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, pe = 1e7, D = 7, Ql = 9007199254740991, Jl = xr.length - 1, On = Pr.length - 1, R = { toStringTag: yo };
R.absoluteValue = R.abs = function () { var e = new this.constructor(this); return e.s < 0 && (e.s = 1), O(e); };
R.ceil = function () { return O(new this.constructor(this), this.e + 1, 2); };
R.clampedTo = R.clamp = function (e, t) { var r, n = this, i = n.constructor; if (e = new i(e), t = new i(t), !e.s || !t.s)
    return new i(NaN); if (e.gt(t))
    throw Error(De + t); return r = n.cmp(e), r < 0 ? e : n.cmp(t) > 0 ? t : new i(n); };
R.comparedTo = R.cmp = function (e) { var t, r, n, i, o = this, s = o.d, a = (e = new o.constructor(e)).d, l = o.s, f = e.s; if (!s || !a)
    return !l || !f ? NaN : l !== f ? l : s === a ? 0 : !s ^ l < 0 ? 1 : -1; if (!s[0] || !a[0])
    return s[0] ? l : a[0] ? -f : 0; if (l !== f)
    return l; if (o.e !== e.e)
    return o.e > e.e ^ l < 0 ? 1 : -1; for (n = s.length, i = a.length, t = 0, r = n < i ? n : i; t < r; ++t)
    if (s[t] !== a[t])
        return s[t] > a[t] ^ l < 0 ? 1 : -1; return n === i ? 0 : n > i ^ l < 0 ? 1 : -1; };
R.cosine = R.cos = function () { var e, t, r = this, n = r.constructor; return r.d ? r.d[0] ? (e = n.precision, t = n.rounding, n.precision = e + Math.max(r.e, r.sd()) + D, n.rounding = 1, r = Wl(n, vo(n, r)), n.precision = e, n.rounding = t, O(Ae == 2 || Ae == 3 ? r.neg() : r, e, t, !0)) : new n(1) : new n(NaN); };
R.cubeRoot = R.cbrt = function () { var e, t, r, n, i, o, s, a, l, f, g = this, h = g.constructor; if (!g.isFinite() || g.isZero())
    return new h(g); for (N = !1, o = g.s * W(g.s * g, 1 / 3), !o || Math.abs(o) == 1 / 0 ? (r = Y(g.d), e = g.e, (o = (e - r.length + 1) % 3) && (r += o == 1 || o == -2 ? "0" : "00"), o = W(r, 1 / 3), e = ee((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2)), o == 1 / 0 ? r = "5e" + e : (r = o.toExponential(), r = r.slice(0, r.indexOf("e") + 1) + e), n = new h(r), n.s = g.s) : n = new h(o.toString()), s = (e = h.precision) + 3;;)
    if (a = n, l = a.times(a).times(a), f = l.plus(g), n = $(f.plus(g).times(a), f.plus(l), s + 2, 1), Y(a.d).slice(0, s) === (r = Y(n.d)).slice(0, s))
        if (r = r.slice(s - 3, s + 1), r == "9999" || !i && r == "4999") {
            if (!i && (O(a, e + 1, 0), a.times(a).times(a).eq(g))) {
                n = a;
                break;
            }
            s += 4, i = 1;
        }
        else {
            (!+r || !+r.slice(1) && r.charAt(0) == "5") && (O(n, e + 1, 1), t = !n.times(n).times(n).eq(g));
            break;
        } return N = !0, O(n, e, h.rounding, t); };
R.decimalPlaces = R.dp = function () { var e, t = this.d, r = NaN; if (t) {
    if (e = t.length - 1, r = (e - ee(this.e / D)) * D, e = t[e], e)
        for (; e % 10 == 0; e /= 10)
            r--;
    r < 0 && (r = 0);
} return r; };
R.dividedBy = R.div = function (e) { return $(this, new this.constructor(e)); };
R.dividedToIntegerBy = R.divToInt = function (e) { var t = this, r = t.constructor; return O($(t, new r(e), 0, 1, 1), r.precision, r.rounding); };
R.equals = R.eq = function (e) { return this.cmp(e) === 0; };
R.floor = function () { return O(new this.constructor(this), this.e + 1, 3); };
R.greaterThan = R.gt = function (e) { return this.cmp(e) > 0; };
R.greaterThanOrEqualTo = R.gte = function (e) { var t = this.cmp(e); return t == 1 || t === 0; };
R.hyperbolicCosine = R.cosh = function () { var e, t, r, n, i, o = this, s = o.constructor, a = new s(1); if (!o.isFinite())
    return new s(o.s ? 1 / 0 : NaN); if (o.isZero())
    return a; r = s.precision, n = s.rounding, s.precision = r + Math.max(o.e, o.sd()) + 4, s.rounding = 1, i = o.d.length, i < 32 ? (e = Math.ceil(i / 3), t = (1 / Cr(4, e)).toString()) : (e = 16, t = "2.3283064365386962890625e-10"), o = tt(s, 1, o.times(t), new s(1), !0); for (var l, f = e, g = new s(8); f--;)
    l = o.times(o), o = a.minus(l.times(g.minus(l.times(g)))); return O(o, s.precision = r, s.rounding = n, !0); };
R.hyperbolicSine = R.sinh = function () { var e, t, r, n, i = this, o = i.constructor; if (!i.isFinite() || i.isZero())
    return new o(i); if (t = o.precision, r = o.rounding, o.precision = t + Math.max(i.e, i.sd()) + 4, o.rounding = 1, n = i.d.length, n < 3)
    i = tt(o, 2, i, i, !0);
else {
    e = 1.4 * Math.sqrt(n), e = e > 16 ? 16 : e | 0, i = i.times(1 / Cr(5, e)), i = tt(o, 2, i, i, !0);
    for (var s, a = new o(5), l = new o(16), f = new o(20); e--;)
        s = i.times(i), i = i.times(a.plus(s.times(l.times(s).plus(f))));
} return o.precision = t, o.rounding = r, O(i, t, r, !0); };
R.hyperbolicTangent = R.tanh = function () { var e, t, r = this, n = r.constructor; return r.isFinite() ? r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + 7, n.rounding = 1, $(r.sinh(), r.cosh(), n.precision = e, n.rounding = t)) : new n(r.s); };
R.inverseCosine = R.acos = function () { var e = this, t = e.constructor, r = e.abs().cmp(1), n = t.precision, i = t.rounding; return r !== -1 ? r === 0 ? e.isNeg() ? ge(t, n, i) : new t(0) : new t(NaN) : e.isZero() ? ge(t, n + 4, i).times(.5) : (t.precision = n + 6, t.rounding = 1, e = new t(1).minus(e).div(e.plus(1)).sqrt().atan(), t.precision = n, t.rounding = i, e.times(2)); };
R.inverseHyperbolicCosine = R.acosh = function () { var e, t, r = this, n = r.constructor; return r.lte(1) ? new n(r.eq(1) ? 0 : NaN) : r.isFinite() ? (e = n.precision, t = n.rounding, n.precision = e + Math.max(Math.abs(r.e), r.sd()) + 4, n.rounding = 1, N = !1, r = r.times(r).minus(1).sqrt().plus(r), N = !0, n.precision = e, n.rounding = t, r.ln()) : new n(r); };
R.inverseHyperbolicSine = R.asinh = function () { var e, t, r = this, n = r.constructor; return !r.isFinite() || r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + 2 * Math.max(Math.abs(r.e), r.sd()) + 6, n.rounding = 1, N = !1, r = r.times(r).plus(1).sqrt().plus(r), N = !0, n.precision = e, n.rounding = t, r.ln()); };
R.inverseHyperbolicTangent = R.atanh = function () { var e, t, r, n, i = this, o = i.constructor; return i.isFinite() ? i.e >= 0 ? new o(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN) : (e = o.precision, t = o.rounding, n = i.sd(), Math.max(n, e) < 2 * -i.e - 1 ? O(new o(i), e, t, !0) : (o.precision = r = n - i.e, i = $(i.plus(1), new o(1).minus(i), r + e, 1), o.precision = e + 4, o.rounding = 1, i = i.ln(), o.precision = e, o.rounding = t, i.times(.5))) : new o(NaN); };
R.inverseSine = R.asin = function () { var e, t, r, n, i = this, o = i.constructor; return i.isZero() ? new o(i) : (t = i.abs().cmp(1), r = o.precision, n = o.rounding, t !== -1 ? t === 0 ? (e = ge(o, r + 4, n).times(.5), e.s = i.s, e) : new o(NaN) : (o.precision = r + 6, o.rounding = 1, i = i.div(new o(1).minus(i.times(i)).sqrt().plus(1)).atan(), o.precision = r, o.rounding = n, i.times(2))); };
R.inverseTangent = R.atan = function () { var e, t, r, n, i, o, s, a, l, f = this, g = f.constructor, h = g.precision, T = g.rounding; if (f.isFinite()) {
    if (f.isZero())
        return new g(f);
    if (f.abs().eq(1) && h + 4 <= On)
        return s = ge(g, h + 4, T).times(.25), s.s = f.s, s;
}
else {
    if (!f.s)
        return new g(NaN);
    if (h + 4 <= On)
        return s = ge(g, h + 4, T).times(.5), s.s = f.s, s;
} for (g.precision = a = h + 10, g.rounding = 1, r = Math.min(28, a / D + 2 | 0), e = r; e; --e)
    f = f.div(f.times(f).plus(1).sqrt().plus(1)); for (N = !1, t = Math.ceil(a / D), n = 1, l = f.times(f), s = new g(f), i = f; e !== -1;)
    if (i = i.times(l), o = s.minus(i.div(n += 2)), i = i.times(l), s = o.plus(i.div(n += 2)), s.d[t] !== void 0)
        for (e = t; s.d[e] === o.d[e] && e--;)
            ; return r && (s = s.times(2 << r - 1)), N = !0, O(s, g.precision = h, g.rounding = T, !0); };
R.isFinite = function () { return !!this.d; };
R.isInteger = R.isInt = function () { return !!this.d && ee(this.e / D) > this.d.length - 2; };
R.isNaN = function () { return !this.s; };
R.isNegative = R.isNeg = function () { return this.s < 0; };
R.isPositive = R.isPos = function () { return this.s > 0; };
R.isZero = function () { return !!this.d && this.d[0] === 0; };
R.lessThan = R.lt = function (e) { return this.cmp(e) < 0; };
R.lessThanOrEqualTo = R.lte = function (e) { return this.cmp(e) < 1; };
R.logarithm = R.log = function (e) { var t, r, n, i, o, s, a, l, f = this, g = f.constructor, h = g.precision, T = g.rounding, k = 5; if (e == null)
    e = new g(10), t = !0;
else {
    if (e = new g(e), r = e.d, e.s < 0 || !r || !r[0] || e.eq(1))
        return new g(NaN);
    t = e.eq(10);
} if (r = f.d, f.s < 0 || !r || !r[0] || f.eq(1))
    return new g(r && !r[0] ? -1 / 0 : f.s != 1 ? NaN : r ? 0 : 1 / 0); if (t)
    if (r.length > 1)
        o = !0;
    else {
        for (i = r[0]; i % 10 === 0;)
            i /= 10;
        o = i !== 1;
    } if (N = !1, a = h + k, s = Oe(f, a), n = t ? vr(g, a + 10) : Oe(e, a), l = $(s, n, a, 1), It(l.d, i = h, T))
    do
        if (a += 10, s = Oe(f, a), n = t ? vr(g, a + 10) : Oe(e, a), l = $(s, n, a, 1), !o) {
            +Y(l.d).slice(i + 1, i + 15) + 1 == 1e14 && (l = O(l, h + 1, 0));
            break;
        }
    while (It(l.d, i += 10, T)); return N = !0, O(l, h, T); };
R.minus = R.sub = function (e) { var t, r, n, i, o, s, a, l, f, g, h, T, k = this, C = k.constructor; if (e = new C(e), !k.d || !e.d)
    return !k.s || !e.s ? e = new C(NaN) : k.d ? e.s = -e.s : e = new C(e.d || k.s !== e.s ? k : NaN), e; if (k.s != e.s)
    return e.s = -e.s, k.plus(e); if (f = k.d, T = e.d, a = C.precision, l = C.rounding, !f[0] || !T[0]) {
    if (T[0])
        e.s = -e.s;
    else if (f[0])
        e = new C(k);
    else
        return new C(l === 3 ? -0 : 0);
    return N ? O(e, a, l) : e;
} if (r = ee(e.e / D), g = ee(k.e / D), f = f.slice(), o = g - r, o) {
    for (h = o < 0, h ? (t = f, o = -o, s = T.length) : (t = T, r = g, s = f.length), n = Math.max(Math.ceil(a / D), s) + 2, o > n && (o = n, t.length = 1), t.reverse(), n = o; n--;)
        t.push(0);
    t.reverse();
}
else {
    for (n = f.length, s = T.length, h = n < s, h && (s = n), n = 0; n < s; n++)
        if (f[n] != T[n]) {
            h = f[n] < T[n];
            break;
        }
    o = 0;
} for (h && (t = f, f = T, T = t, e.s = -e.s), s = f.length, n = T.length - s; n > 0; --n)
    f[s++] = 0; for (n = T.length; n > o;) {
    if (f[--n] < T[n]) {
        for (i = n; i && f[--i] === 0;)
            f[i] = pe - 1;
        --f[i], f[n] += pe;
    }
    f[n] -= T[n];
} for (; f[--s] === 0;)
    f.pop(); for (; f[0] === 0; f.shift())
    --r; return f[0] ? (e.d = f, e.e = Ar(f, r), N ? O(e, a, l) : e) : new C(l === 3 ? -0 : 0); };
R.modulo = R.mod = function (e) { var t, r = this, n = r.constructor; return e = new n(e), !r.d || !e.s || e.d && !e.d[0] ? new n(NaN) : !e.d || r.d && !r.d[0] ? O(new n(r), n.precision, n.rounding) : (N = !1, n.modulo == 9 ? (t = $(r, e.abs(), 0, 3, 1), t.s *= e.s) : t = $(r, e, 0, n.modulo, 1), t = t.times(e), N = !0, r.minus(t)); };
R.naturalExponential = R.exp = function () { return Dn(this); };
R.naturalLogarithm = R.ln = function () { return Oe(this); };
R.negated = R.neg = function () { var e = new this.constructor(this); return e.s = -e.s, O(e); };
R.plus = R.add = function (e) { var t, r, n, i, o, s, a, l, f, g, h = this, T = h.constructor; if (e = new T(e), !h.d || !e.d)
    return !h.s || !e.s ? e = new T(NaN) : h.d || (e = new T(e.d || h.s === e.s ? h : NaN)), e; if (h.s != e.s)
    return e.s = -e.s, h.minus(e); if (f = h.d, g = e.d, a = T.precision, l = T.rounding, !f[0] || !g[0])
    return g[0] || (e = new T(h)), N ? O(e, a, l) : e; if (o = ee(h.e / D), n = ee(e.e / D), f = f.slice(), i = o - n, i) {
    for (i < 0 ? (r = f, i = -i, s = g.length) : (r = g, n = o, s = f.length), o = Math.ceil(a / D), s = o > s ? o + 1 : s + 1, i > s && (i = s, r.length = 1), r.reverse(); i--;)
        r.push(0);
    r.reverse();
} for (s = f.length, i = g.length, s - i < 0 && (i = s, r = g, g = f, f = r), t = 0; i;)
    t = (f[--i] = f[i] + g[i] + t) / pe | 0, f[i] %= pe; for (t && (f.unshift(t), ++n), s = f.length; f[--s] == 0;)
    f.pop(); return e.d = f, e.e = Ar(f, n), N ? O(e, a, l) : e; };
R.precision = R.sd = function (e) { var t, r = this; if (e !== void 0 && e !== !!e && e !== 1 && e !== 0)
    throw Error(De + e); return r.d ? (t = Eo(r.d), e && r.e + 1 > t && (t = r.e + 1)) : t = NaN, t; };
R.round = function () { var e = this, t = e.constructor; return O(new t(e), e.e + 1, t.rounding); };
R.sine = R.sin = function () { var e, t, r = this, n = r.constructor; return r.isFinite() ? r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + Math.max(r.e, r.sd()) + D, n.rounding = 1, r = Hl(n, vo(n, r)), n.precision = e, n.rounding = t, O(Ae > 2 ? r.neg() : r, e, t, !0)) : new n(NaN); };
R.squareRoot = R.sqrt = function () { var e, t, r, n, i, o, s = this, a = s.d, l = s.e, f = s.s, g = s.constructor; if (f !== 1 || !a || !a[0])
    return new g(!f || f < 0 && (!a || a[0]) ? NaN : a ? s : 1 / 0); for (N = !1, f = Math.sqrt(+s), f == 0 || f == 1 / 0 ? (t = Y(a), (t.length + l) % 2 == 0 && (t += "0"), f = Math.sqrt(t), l = ee((l + 1) / 2) - (l < 0 || l % 2), f == 1 / 0 ? t = "5e" + l : (t = f.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + l), n = new g(t)) : n = new g(f.toString()), r = (l = g.precision) + 3;;)
    if (o = n, n = o.plus($(s, o, r + 2, 1)).times(.5), Y(o.d).slice(0, r) === (t = Y(n.d)).slice(0, r))
        if (t = t.slice(r - 3, r + 1), t == "9999" || !i && t == "4999") {
            if (!i && (O(o, l + 1, 0), o.times(o).eq(s))) {
                n = o;
                break;
            }
            r += 4, i = 1;
        }
        else {
            (!+t || !+t.slice(1) && t.charAt(0) == "5") && (O(n, l + 1, 1), e = !n.times(n).eq(s));
            break;
        } return N = !0, O(n, l, g.rounding, e); };
R.tangent = R.tan = function () { var e, t, r = this, n = r.constructor; return r.isFinite() ? r.isZero() ? new n(r) : (e = n.precision, t = n.rounding, n.precision = e + 10, n.rounding = 1, r = r.sin(), r.s = 1, r = $(r, new n(1).minus(r.times(r)).sqrt(), e + 10, 0), n.precision = e, n.rounding = t, O(Ae == 2 || Ae == 4 ? r.neg() : r, e, t, !0)) : new n(NaN); };
R.times = R.mul = function (e) { var t, r, n, i, o, s, a, l, f, g = this, h = g.constructor, T = g.d, k = (e = new h(e)).d; if (e.s *= g.s, !T || !T[0] || !k || !k[0])
    return new h(!e.s || T && !T[0] && !k || k && !k[0] && !T ? NaN : !T || !k ? e.s / 0 : e.s * 0); for (r = ee(g.e / D) + ee(e.e / D), l = T.length, f = k.length, l < f && (o = T, T = k, k = o, s = l, l = f, f = s), o = [], s = l + f, n = s; n--;)
    o.push(0); for (n = f; --n >= 0;) {
    for (t = 0, i = l + n; i > n;)
        a = o[i] + k[n] * T[i - n - 1] + t, o[i--] = a % pe | 0, t = a / pe | 0;
    o[i] = (o[i] + t) % pe | 0;
} for (; !o[--s];)
    o.pop(); return t ? ++r : o.shift(), e.d = o, e.e = Ar(o, r), N ? O(e, h.precision, h.rounding) : e; };
R.toBinary = function (e, t) { return Mn(this, 2, e, t); };
R.toDecimalPlaces = R.toDP = function (e, t) { var r = this, n = r.constructor; return r = new n(r), e === void 0 ? r : (oe(e, 0, Me), t === void 0 ? t = n.rounding : oe(t, 0, 8), O(r, e + r.e + 1, t)); };
R.toExponential = function (e, t) { var r, n = this, i = n.constructor; return e === void 0 ? r = he(n, !0) : (oe(e, 0, Me), t === void 0 ? t = i.rounding : oe(t, 0, 8), n = O(new i(n), e + 1, t), r = he(n, !0, e + 1)), n.isNeg() && !n.isZero() ? "-" + r : r; };
R.toFixed = function (e, t) { var r, n, i = this, o = i.constructor; return e === void 0 ? r = he(i) : (oe(e, 0, Me), t === void 0 ? t = o.rounding : oe(t, 0, 8), n = O(new o(i), e + i.e + 1, t), r = he(n, !1, e + n.e + 1)), i.isNeg() && !i.isZero() ? "-" + r : r; };
R.toFraction = function (e) { var t, r, n, i, o, s, a, l, f, g, h, T, k = this, C = k.d, S = k.constructor; if (!C)
    return new S(k); if (f = r = new S(1), n = l = new S(0), t = new S(n), o = t.e = Eo(C) - k.e - 1, s = o % D, t.d[0] = W(10, s < 0 ? D + s : s), e == null)
    e = o > 0 ? t : f;
else {
    if (a = new S(e), !a.isInt() || a.lt(f))
        throw Error(De + a);
    e = a.gt(t) ? o > 0 ? t : f : a;
} for (N = !1, a = new S(Y(C)), g = S.precision, S.precision = o = C.length * D * 2; h = $(a, t, 0, 1, 1), i = r.plus(h.times(n)), i.cmp(e) != 1;)
    r = n, n = i, i = f, f = l.plus(h.times(i)), l = i, i = t, t = a.minus(h.times(i)), a = i; return i = $(e.minus(r), n, 0, 1, 1), l = l.plus(i.times(f)), r = r.plus(i.times(n)), l.s = f.s = k.s, T = $(f, n, o, 1).minus(k).abs().cmp($(l, r, o, 1).minus(k).abs()) < 1 ? [f, n] : [l, r], S.precision = g, N = !0, T; };
R.toHexadecimal = R.toHex = function (e, t) { return Mn(this, 16, e, t); };
R.toNearest = function (e, t) { var r = this, n = r.constructor; if (r = new n(r), e == null) {
    if (!r.d)
        return r;
    e = new n(1), t = n.rounding;
}
else {
    if (e = new n(e), t === void 0 ? t = n.rounding : oe(t, 0, 8), !r.d)
        return e.s ? r : e;
    if (!e.d)
        return e.s && (e.s = r.s), e;
} return e.d[0] ? (N = !1, r = $(r, e, 0, t, 1).times(e), N = !0, O(r)) : (e.s = r.s, r = e), r; };
R.toNumber = function () { return +this; };
R.toOctal = function (e, t) { return Mn(this, 8, e, t); };
R.toPower = R.pow = function (e) { var t, r, n, i, o, s, a = this, l = a.constructor, f = +(e = new l(e)); if (!a.d || !e.d || !a.d[0] || !e.d[0])
    return new l(W(+a, f)); if (a = new l(a), a.eq(1))
    return a; if (n = l.precision, o = l.rounding, e.eq(1))
    return O(a, n, o); if (t = ee(e.e / D), t >= e.d.length - 1 && (r = f < 0 ? -f : f) <= Ql)
    return i = bo(l, a, r, n), e.s < 0 ? new l(1).div(i) : O(i, n, o); if (s = a.s, s < 0) {
    if (t < e.d.length - 1)
        return new l(NaN);
    if ((e.d[t] & 1) == 0 && (s = 1), a.e == 0 && a.d[0] == 1 && a.d.length == 1)
        return a.s = s, a;
} return r = W(+a, f), t = r == 0 || !isFinite(r) ? ee(f * (Math.log("0." + Y(a.d)) / Math.LN10 + a.e + 1)) : new l(r + "").e, t > l.maxE + 1 || t < l.minE - 1 ? new l(t > 0 ? s / 0 : 0) : (N = !1, l.rounding = a.s = 1, r = Math.min(12, (t + "").length), i = Dn(e.times(Oe(a, n + r)), n), i.d && (i = O(i, n + 5, 1), It(i.d, n, o) && (t = n + 10, i = O(Dn(e.times(Oe(a, t + r)), t), t + 5, 1), +Y(i.d).slice(n + 1, n + 15) + 1 == 1e14 && (i = O(i, n + 1, 0)))), i.s = s, N = !0, l.rounding = o, O(i, n, o)); };
R.toPrecision = function (e, t) { var r, n = this, i = n.constructor; return e === void 0 ? r = he(n, n.e <= i.toExpNeg || n.e >= i.toExpPos) : (oe(e, 1, Me), t === void 0 ? t = i.rounding : oe(t, 0, 8), n = O(new i(n), e, t), r = he(n, e <= n.e || n.e <= i.toExpNeg, e)), n.isNeg() && !n.isZero() ? "-" + r : r; };
R.toSignificantDigits = R.toSD = function (e, t) { var r = this, n = r.constructor; return e === void 0 ? (e = n.precision, t = n.rounding) : (oe(e, 1, Me), t === void 0 ? t = n.rounding : oe(t, 0, 8)), O(new n(r), e, t); };
R.toString = function () { var e = this, t = e.constructor, r = he(e, e.e <= t.toExpNeg || e.e >= t.toExpPos); return e.isNeg() && !e.isZero() ? "-" + r : r; };
R.truncated = R.trunc = function () { return O(new this.constructor(this), this.e + 1, 1); };
R.valueOf = R.toJSON = function () { var e = this, t = e.constructor, r = he(e, e.e <= t.toExpNeg || e.e >= t.toExpPos); return e.isNeg() ? "-" + r : r; };
function Y(e) { var t, r, n, i = e.length - 1, o = "", s = e[0]; if (i > 0) {
    for (o += s, t = 1; t < i; t++)
        n = e[t] + "", r = D - n.length, r && (o += Ie(r)), o += n;
    s = e[t], n = s + "", r = D - n.length, r && (o += Ie(r));
}
else if (s === 0)
    return "0"; for (; s % 10 === 0;)
    s /= 10; return o + s; }
function oe(e, t, r) { if (e !== ~~e || e < t || e > r)
    throw Error(De + e); }
function It(e, t, r, n) { var i, o, s, a; for (o = e[0]; o >= 10; o /= 10)
    --t; return --t < 0 ? (t += D, i = 0) : (i = Math.ceil((t + 1) / D), t %= D), o = W(10, D - t), a = e[i] % o | 0, n == null ? t < 3 ? (t == 0 ? a = a / 100 | 0 : t == 1 && (a = a / 10 | 0), s = r < 4 && a == 99999 || r > 3 && a == 49999 || a == 5e4 || a == 0) : s = (r < 4 && a + 1 == o || r > 3 && a + 1 == o / 2) && (e[i + 1] / o / 100 | 0) == W(10, t - 2) - 1 || (a == o / 2 || a == 0) && (e[i + 1] / o / 100 | 0) == 0 : t < 4 ? (t == 0 ? a = a / 1e3 | 0 : t == 1 ? a = a / 100 | 0 : t == 2 && (a = a / 10 | 0), s = (n || r < 4) && a == 9999 || !n && r > 3 && a == 4999) : s = ((n || r < 4) && a + 1 == o || !n && r > 3 && a + 1 == o / 2) && (e[i + 1] / o / 1e3 | 0) == W(10, t - 3) - 1, s; }
function Er(e, t, r) { for (var n, i = [0], o, s = 0, a = e.length; s < a;) {
    for (o = i.length; o--;)
        i[o] *= t;
    for (i[0] += kn.indexOf(e.charAt(s++)), n = 0; n < i.length; n++)
        i[n] > r - 1 && (i[n + 1] === void 0 && (i[n + 1] = 0), i[n + 1] += i[n] / r | 0, i[n] %= r);
} return i.reverse(); }
function Wl(e, t) { var r, n, i; if (t.isZero())
    return t; n = t.d.length, n < 32 ? (r = Math.ceil(n / 3), i = (1 / Cr(4, r)).toString()) : (r = 16, i = "2.3283064365386962890625e-10"), e.precision += r, t = tt(e, 1, t.times(i), new e(1)); for (var o = r; o--;) {
    var s = t.times(t);
    t = s.times(s).minus(s).times(8).plus(1);
} return e.precision -= r, t; }
var $ = function () { function e(n, i, o) { var s, a = 0, l = n.length; for (n = n.slice(); l--;)
    s = n[l] * i + a, n[l] = s % o | 0, a = s / o | 0; return a && n.unshift(a), n; } function t(n, i, o, s) { var a, l; if (o != s)
    l = o > s ? 1 : -1;
else
    for (a = l = 0; a < o; a++)
        if (n[a] != i[a]) {
            l = n[a] > i[a] ? 1 : -1;
            break;
        } return l; } function r(n, i, o, s) { for (var a = 0; o--;)
    n[o] -= a, a = n[o] < i[o] ? 1 : 0, n[o] = a * s + n[o] - i[o]; for (; !n[0] && n.length > 1;)
    n.shift(); } return function (n, i, o, s, a, l) { var f, g, h, T, k, C, S, M, _, B, I, L, le, Q, ln, sr, vt, un, ce, ar, lr = n.constructor, cn = n.s == i.s ? 1 : -1, Z = n.d, V = i.d; if (!Z || !Z[0] || !V || !V[0])
    return new lr(!n.s || !i.s || (Z ? V && Z[0] == V[0] : !V) ? NaN : Z && Z[0] == 0 || !V ? cn * 0 : cn / 0); for (l ? (k = 1, g = n.e - i.e) : (l = pe, k = D, g = ee(n.e / k) - ee(i.e / k)), ce = V.length, vt = Z.length, _ = new lr(cn), B = _.d = [], h = 0; V[h] == (Z[h] || 0); h++)
    ; if (V[h] > (Z[h] || 0) && g--, o == null ? (Q = o = lr.precision, s = lr.rounding) : a ? Q = o + (n.e - i.e) + 1 : Q = o, Q < 0)
    B.push(1), C = !0;
else {
    if (Q = Q / k + 2 | 0, h = 0, ce == 1) {
        for (T = 0, V = V[0], Q++; (h < vt || T) && Q--; h++)
            ln = T * l + (Z[h] || 0), B[h] = ln / V | 0, T = ln % V | 0;
        C = T || h < vt;
    }
    else {
        for (T = l / (V[0] + 1) | 0, T > 1 && (V = e(V, T, l), Z = e(Z, T, l), ce = V.length, vt = Z.length), sr = ce, I = Z.slice(0, ce), L = I.length; L < ce;)
            I[L++] = 0;
        ar = V.slice(), ar.unshift(0), un = V[0], V[1] >= l / 2 && ++un;
        do
            T = 0, f = t(V, I, ce, L), f < 0 ? (le = I[0], ce != L && (le = le * l + (I[1] || 0)), T = le / un | 0, T > 1 ? (T >= l && (T = l - 1), S = e(V, T, l), M = S.length, L = I.length, f = t(S, I, M, L), f == 1 && (T--, r(S, ce < M ? ar : V, M, l))) : (T == 0 && (f = T = 1), S = V.slice()), M = S.length, M < L && S.unshift(0), r(I, S, L, l), f == -1 && (L = I.length, f = t(V, I, ce, L), f < 1 && (T++, r(I, ce < L ? ar : V, L, l))), L = I.length) : f === 0 && (T++, I = [0]), B[h++] = T, f && I[0] ? I[L++] = Z[sr] || 0 : (I = [Z[sr]], L = 1);
        while ((sr++ < vt || I[0] !== void 0) && Q--);
        C = I[0] !== void 0;
    }
    B[0] || B.shift();
} if (k == 1)
    _.e = g, fo = C;
else {
    for (h = 1, T = B[0]; T >= 10; T /= 10)
        h++;
    _.e = h + g * k - 1, O(_, a ? o + _.e + 1 : o, s, C);
} return _; }; }();
function O(e, t, r, n) { var i, o, s, a, l, f, g, h, T, k = e.constructor; e: if (t != null) {
    if (h = e.d, !h)
        return e;
    for (i = 1, a = h[0]; a >= 10; a /= 10)
        i++;
    if (o = t - i, o < 0)
        o += D, s = t, g = h[T = 0], l = g / W(10, i - s - 1) % 10 | 0;
    else if (T = Math.ceil((o + 1) / D), a = h.length, T >= a)
        if (n) {
            for (; a++ <= T;)
                h.push(0);
            g = l = 0, i = 1, o %= D, s = o - D + 1;
        }
        else
            break e;
    else {
        for (g = a = h[T], i = 1; a >= 10; a /= 10)
            i++;
        o %= D, s = o - D + i, l = s < 0 ? 0 : g / W(10, i - s - 1) % 10 | 0;
    }
    if (n = n || t < 0 || h[T + 1] !== void 0 || (s < 0 ? g : g % W(10, i - s - 1)), f = r < 4 ? (l || n) && (r == 0 || r == (e.s < 0 ? 3 : 2)) : l > 5 || l == 5 && (r == 4 || n || r == 6 && (o > 0 ? s > 0 ? g / W(10, i - s) : 0 : h[T - 1]) % 10 & 1 || r == (e.s < 0 ? 8 : 7)), t < 1 || !h[0])
        return h.length = 0, f ? (t -= e.e + 1, h[0] = W(10, (D - t % D) % D), e.e = -t || 0) : h[0] = e.e = 0, e;
    if (o == 0 ? (h.length = T, a = 1, T--) : (h.length = T + 1, a = W(10, D - o), h[T] = s > 0 ? (g / W(10, i - s) % W(10, s) | 0) * a : 0), f)
        for (;;)
            if (T == 0) {
                for (o = 1, s = h[0]; s >= 10; s /= 10)
                    o++;
                for (s = h[0] += a, a = 1; s >= 10; s /= 10)
                    a++;
                o != a && (e.e++, h[0] == pe && (h[0] = 1));
                break;
            }
            else {
                if (h[T] += a, h[T] != pe)
                    break;
                h[T--] = 0, a = 1;
            }
    for (o = h.length; h[--o] === 0;)
        h.pop();
} return N && (e.e > k.maxE ? (e.d = null, e.e = NaN) : e.e < k.minE && (e.e = 0, e.d = [0])), e; }
function he(e, t, r) { if (!e.isFinite())
    return Po(e); var n, i = e.e, o = Y(e.d), s = o.length; return t ? (r && (n = r - s) > 0 ? o = o.charAt(0) + "." + o.slice(1) + Ie(n) : s > 1 && (o = o.charAt(0) + "." + o.slice(1)), o = o + (e.e < 0 ? "e" : "e+") + e.e) : i < 0 ? (o = "0." + Ie(-i - 1) + o, r && (n = r - s) > 0 && (o += Ie(n))) : i >= s ? (o += Ie(i + 1 - s), r && (n = r - i - 1) > 0 && (o = o + "." + Ie(n))) : ((n = i + 1) < s && (o = o.slice(0, n) + "." + o.slice(n)), r && (n = r - s) > 0 && (i + 1 === s && (o += "."), o += Ie(n))), o; }
function Ar(e, t) { var r = e[0]; for (t *= D; r >= 10; r /= 10)
    t++; return t; }
function vr(e, t, r) { if (t > Jl)
    throw N = !0, r && (e.precision = r), Error(go); return O(new e(xr), t, 1, !0); }
function ge(e, t, r) { if (t > On)
    throw Error(go); return O(new e(Pr), t, r, !0); }
function Eo(e) { var t = e.length - 1, r = t * D + 1; if (t = e[t], t) {
    for (; t % 10 == 0; t /= 10)
        r--;
    for (t = e[0]; t >= 10; t /= 10)
        r++;
} return r; }
function Ie(e) { for (var t = ""; e--;)
    t += "0"; return t; }
function bo(e, t, r, n) { var i, o = new e(1), s = Math.ceil(n / D + 4); for (N = !1;;) {
    if (r % 2 && (o = o.times(t), po(o.d, s) && (i = !0)), r = ee(r / 2), r === 0) {
        r = o.d.length - 1, i && o.d[r] === 0 && ++o.d[r];
        break;
    }
    t = t.times(t), po(t.d, s);
} return N = !0, o; }
function co(e) { return e.d[e.d.length - 1] & 1; }
function xo(e, t, r) { for (var n, i, o = new e(t[0]), s = 0; ++s < t.length;) {
    if (i = new e(t[s]), !i.s) {
        o = i;
        break;
    }
    n = o.cmp(i), (n === r || n === 0 && o.s === r) && (o = i);
} return o; }
function Dn(e, t) { var r, n, i, o, s, a, l, f = 0, g = 0, h = 0, T = e.constructor, k = T.rounding, C = T.precision; if (!e.d || !e.d[0] || e.e > 17)
    return new T(e.d ? e.d[0] ? e.s < 0 ? 0 : 1 / 0 : 1 : e.s ? e.s < 0 ? 0 : e : NaN); for (t == null ? (N = !1, l = C) : l = t, a = new T(.03125); e.e > -2;)
    e = e.times(a), h += 5; for (n = Math.log(W(2, h)) / Math.LN10 * 2 + 5 | 0, l += n, r = o = s = new T(1), T.precision = l;;) {
    if (o = O(o.times(e), l, 1), r = r.times(++g), a = s.plus($(o, r, l, 1)), Y(a.d).slice(0, l) === Y(s.d).slice(0, l)) {
        for (i = h; i--;)
            s = O(s.times(s), l, 1);
        if (t == null)
            if (f < 3 && It(s.d, l - n, k, f))
                T.precision = l += 10, r = o = a = new T(1), g = 0, f++;
            else
                return O(s, T.precision = C, k, N = !0);
        else
            return T.precision = C, s;
    }
    s = a;
} }
function Oe(e, t) { var r, n, i, o, s, a, l, f, g, h, T, k = 1, C = 10, S = e, M = S.d, _ = S.constructor, B = _.rounding, I = _.precision; if (S.s < 0 || !M || !M[0] || !S.e && M[0] == 1 && M.length == 1)
    return new _(M && !M[0] ? -1 / 0 : S.s != 1 ? NaN : M ? 0 : S); if (t == null ? (N = !1, g = I) : g = t, _.precision = g += C, r = Y(M), n = r.charAt(0), Math.abs(o = S.e) < 15e14) {
    for (; n < 7 && n != 1 || n == 1 && r.charAt(1) > 3;)
        S = S.times(e), r = Y(S.d), n = r.charAt(0), k++;
    o = S.e, n > 1 ? (S = new _("0." + r), o++) : S = new _(n + "." + r.slice(1));
}
else
    return f = vr(_, g + 2, I).times(o + ""), S = Oe(new _(n + "." + r.slice(1)), g - C).plus(f), _.precision = I, t == null ? O(S, I, B, N = !0) : S; for (h = S, l = s = S = $(S.minus(1), S.plus(1), g, 1), T = O(S.times(S), g, 1), i = 3;;) {
    if (s = O(s.times(T), g, 1), f = l.plus($(s, new _(i), g, 1)), Y(f.d).slice(0, g) === Y(l.d).slice(0, g))
        if (l = l.times(2), o !== 0 && (l = l.plus(vr(_, g + 2, I).times(o + ""))), l = $(l, new _(k), g, 1), t == null)
            if (It(l.d, g - C, B, a))
                _.precision = g += C, f = s = S = $(h.minus(1), h.plus(1), g, 1), T = O(S.times(S), g, 1), i = a = 1;
            else
                return O(l, _.precision = I, B, N = !0);
        else
            return _.precision = I, l;
    l = f, i += 2;
} }
function Po(e) { return String(e.s * e.s / 0); }
function br(e, t) { var r, n, i; for ((r = t.indexOf(".")) > -1 && (t = t.replace(".", "")), (n = t.search(/e/i)) > 0 ? (r < 0 && (r = n), r += +t.slice(n + 1), t = t.substring(0, n)) : r < 0 && (r = t.length), n = 0; t.charCodeAt(n) === 48; n++)
    ; for (i = t.length; t.charCodeAt(i - 1) === 48; --i)
    ; if (t = t.slice(n, i), t) {
    if (i -= n, e.e = r = r - n - 1, e.d = [], n = (r + 1) % D, r < 0 && (n += D), n < i) {
        for (n && e.d.push(+t.slice(0, n)), i -= D; n < i;)
            e.d.push(+t.slice(n, n += D));
        t = t.slice(n), n = D - t.length;
    }
    else
        n -= i;
    for (; n--;)
        t += "0";
    e.d.push(+t), N && (e.e > e.constructor.maxE ? (e.d = null, e.e = NaN) : e.e < e.constructor.minE && (e.e = 0, e.d = [0]));
}
else
    e.e = 0, e.d = [0]; return e; }
function Kl(e, t) { var r, n, i, o, s, a, l, f, g; if (t.indexOf("_") > -1) {
    if (t = t.replace(/(\d)_(?=\d)/g, "$1"), wo.test(t))
        return br(e, t);
}
else if (t === "Infinity" || t === "NaN")
    return +t || (e.s = NaN), e.e = NaN, e.d = null, e; if (jl.test(t))
    r = 16, t = t.toLowerCase();
else if (Vl.test(t))
    r = 2;
else if (Gl.test(t))
    r = 8;
else
    throw Error(De + t); for (o = t.search(/p/i), o > 0 ? (l = +t.slice(o + 1), t = t.substring(2, o)) : t = t.slice(2), o = t.indexOf("."), s = o >= 0, n = e.constructor, s && (t = t.replace(".", ""), a = t.length, o = a - o, i = bo(n, new n(r), o, o * 2)), f = Er(t, r, pe), g = f.length - 1, o = g; f[o] === 0; --o)
    f.pop(); return o < 0 ? new n(e.s * 0) : (e.e = Ar(f, g), e.d = f, N = !1, s && (e = $(e, i, a * 4)), l && (e = e.times(Math.abs(l) < 54 ? W(2, l) : qe.pow(2, l))), N = !0, e); }
function Hl(e, t) { var r, n = t.d.length; if (n < 3)
    return t.isZero() ? t : tt(e, 2, t, t); r = 1.4 * Math.sqrt(n), r = r > 16 ? 16 : r | 0, t = t.times(1 / Cr(5, r)), t = tt(e, 2, t, t); for (var i, o = new e(5), s = new e(16), a = new e(20); r--;)
    i = t.times(t), t = t.times(o.plus(i.times(s.times(i).minus(a)))); return t; }
function tt(e, t, r, n, i) { var o, s, a, l, f = 1, g = e.precision, h = Math.ceil(g / D); for (N = !1, l = r.times(r), a = new e(n);;) {
    if (s = $(a.times(l), new e(t++ * t++), g, 1), a = i ? n.plus(s) : n.minus(s), n = $(s.times(l), new e(t++ * t++), g, 1), s = a.plus(n), s.d[h] !== void 0) {
        for (o = h; s.d[o] === a.d[o] && o--;)
            ;
        if (o == -1)
            break;
    }
    o = a, a = n, n = s, s = o, f++;
} return N = !0, s.d.length = h + 1, s; }
function Cr(e, t) { for (var r = e; --t;)
    r *= e; return r; }
function vo(e, t) { var r, n = t.s < 0, i = ge(e, e.precision, 1), o = i.times(.5); if (t = t.abs(), t.lte(o))
    return Ae = n ? 4 : 1, t; if (r = t.divToInt(i), r.isZero())
    Ae = n ? 3 : 2;
else {
    if (t = t.minus(r.times(i)), t.lte(o))
        return Ae = co(r) ? n ? 2 : 3 : n ? 4 : 1, t;
    Ae = co(r) ? n ? 1 : 4 : n ? 3 : 2;
} return t.minus(i).abs(); }
function Mn(e, t, r, n) { var i, o, s, a, l, f, g, h, T, k = e.constructor, C = r !== void 0; if (C ? (oe(r, 1, Me), n === void 0 ? n = k.rounding : oe(n, 0, 8)) : (r = k.precision, n = k.rounding), !e.isFinite())
    g = Po(e);
else {
    for (g = he(e), s = g.indexOf("."), C ? (i = 2, t == 16 ? r = r * 4 - 3 : t == 8 && (r = r * 3 - 2)) : i = t, s >= 0 && (g = g.replace(".", ""), T = new k(1), T.e = g.length - s, T.d = Er(he(T), 10, i), T.e = T.d.length), h = Er(g, 10, i), o = l = h.length; h[--l] == 0;)
        h.pop();
    if (!h[0])
        g = C ? "0p+0" : "0";
    else {
        if (s < 0 ? o-- : (e = new k(e), e.d = h, e.e = o, e = $(e, T, r, n, 0, i), h = e.d, o = e.e, f = fo), s = h[r], a = i / 2, f = f || h[r + 1] !== void 0, f = n < 4 ? (s !== void 0 || f) && (n === 0 || n === (e.s < 0 ? 3 : 2)) : s > a || s === a && (n === 4 || f || n === 6 && h[r - 1] & 1 || n === (e.s < 0 ? 8 : 7)), h.length = r, f)
            for (; ++h[--r] > i - 1;)
                h[r] = 0, r || (++o, h.unshift(1));
        for (l = h.length; !h[l - 1]; --l)
            ;
        for (s = 0, g = ""; s < l; s++)
            g += kn.charAt(h[s]);
        if (C) {
            if (l > 1)
                if (t == 16 || t == 8) {
                    for (s = t == 16 ? 4 : 3, --l; l % s; l++)
                        g += "0";
                    for (h = Er(g, i, t), l = h.length; !h[l - 1]; --l)
                        ;
                    for (s = 1, g = "1."; s < l; s++)
                        g += kn.charAt(h[s]);
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
function po(e, t) { if (e.length > t)
    return e.length = t, !0; }
function zl(e) { return new this(e).abs(); }
function Yl(e) { return new this(e).acos(); }
function Zl(e) { return new this(e).acosh(); }
function Xl(e, t) { return new this(e).plus(t); }
function eu(e) { return new this(e).asin(); }
function tu(e) { return new this(e).asinh(); }
function ru(e) { return new this(e).atan(); }
function nu(e) { return new this(e).atanh(); }
function iu(e, t) { e = new this(e), t = new this(t); var r, n = this.precision, i = this.rounding, o = n + 4; return !e.s || !t.s ? r = new this(NaN) : !e.d && !t.d ? (r = ge(this, o, 1).times(t.s > 0 ? .25 : .75), r.s = e.s) : !t.d || e.isZero() ? (r = t.s < 0 ? ge(this, n, i) : new this(0), r.s = e.s) : !e.d || t.isZero() ? (r = ge(this, o, 1).times(.5), r.s = e.s) : t.s < 0 ? (this.precision = o, this.rounding = 1, r = this.atan($(e, t, o, 1)), t = ge(this, o, 1), this.precision = n, this.rounding = i, r = e.s < 0 ? r.minus(t) : r.plus(t)) : r = this.atan($(e, t, o, 1)), r; }
function ou(e) { return new this(e).cbrt(); }
function su(e) { return O(e = new this(e), e.e + 1, 2); }
function au(e, t, r) { return new this(e).clamp(t, r); }
function lu(e) { if (!e || typeof e != "object")
    throw Error(Tr + "Object expected"); var t, r, n, i = e.defaults === !0, o = ["precision", 1, Me, "rounding", 0, 8, "toExpNeg", -et, 0, "toExpPos", 0, et, "maxE", 0, et, "minE", -et, 0, "modulo", 0, 9]; for (t = 0; t < o.length; t += 3)
    if (r = o[t], i && (this[r] = In[r]), (n = e[r]) !== void 0)
        if (ee(n) === n && n >= o[t + 1] && n <= o[t + 2])
            this[r] = n;
        else
            throw Error(De + r + ": " + n); if (r = "crypto", i && (this[r] = In[r]), (n = e[r]) !== void 0)
    if (n === !0 || n === !1 || n === 0 || n === 1)
        if (n)
            if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
                this[r] = !0;
            else
                throw Error(ho);
        else
            this[r] = !1;
    else
        throw Error(De + r + ": " + n); return this; }
function uu(e) { return new this(e).cos(); }
function cu(e) { return new this(e).cosh(); }
function To(e) { var t, r, n; function i(o) { var s, a, l, f = this; if (!(f instanceof i))
    return new i(o); if (f.constructor = i, mo(o)) {
    f.s = o.s, N ? !o.d || o.e > i.maxE ? (f.e = NaN, f.d = null) : o.e < i.minE ? (f.e = 0, f.d = [0]) : (f.e = o.e, f.d = o.d.slice()) : (f.e = o.e, f.d = o.d ? o.d.slice() : o.d);
    return;
} if (l = typeof o, l === "number") {
    if (o === 0) {
        f.s = 1 / o < 0 ? -1 : 1, f.e = 0, f.d = [0];
        return;
    }
    if (o < 0 ? (o = -o, f.s = -1) : f.s = 1, o === ~~o && o < 1e7) {
        for (s = 0, a = o; a >= 10; a /= 10)
            s++;
        N ? s > i.maxE ? (f.e = NaN, f.d = null) : s < i.minE ? (f.e = 0, f.d = [0]) : (f.e = s, f.d = [o]) : (f.e = s, f.d = [o]);
        return;
    }
    if (o * 0 !== 0) {
        o || (f.s = NaN), f.e = NaN, f.d = null;
        return;
    }
    return br(f, o.toString());
} if (l === "string")
    return (a = o.charCodeAt(0)) === 45 ? (o = o.slice(1), f.s = -1) : (a === 43 && (o = o.slice(1)), f.s = 1), wo.test(o) ? br(f, o) : Kl(f, o); if (l === "bigint")
    return o < 0 ? (o = -o, f.s = -1) : f.s = 1, br(f, o.toString()); throw Error(De + o); } if (i.prototype = R, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.EUCLID = 9, i.config = i.set = lu, i.clone = To, i.isDecimal = mo, i.abs = zl, i.acos = Yl, i.acosh = Zl, i.add = Xl, i.asin = eu, i.asinh = tu, i.atan = ru, i.atanh = nu, i.atan2 = iu, i.cbrt = ou, i.ceil = su, i.clamp = au, i.cos = uu, i.cosh = cu, i.div = pu, i.exp = mu, i.floor = du, i.hypot = fu, i.ln = gu, i.log = hu, i.log10 = wu, i.log2 = yu, i.max = Eu, i.min = bu, i.mod = xu, i.mul = Pu, i.pow = vu, i.random = Tu, i.round = Au, i.sign = Cu, i.sin = Ru, i.sinh = Su, i.sqrt = ku, i.sub = Iu, i.sum = Ou, i.tan = Du, i.tanh = Mu, i.trunc = _u, e === void 0 && (e = {}), e && e.defaults !== !0)
    for (n = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], t = 0; t < n.length;)
        e.hasOwnProperty(r = n[t++]) || (e[r] = this[r]); return i.config(e), i; }
function pu(e, t) { return new this(e).div(t); }
function mu(e) { return new this(e).exp(); }
function du(e) { return O(e = new this(e), e.e + 1, 3); }
function fu() { var e, t, r = new this(0); for (N = !1, e = 0; e < arguments.length;)
    if (t = new this(arguments[e++]), t.d)
        r.d && (r = r.plus(t.times(t)));
    else {
        if (t.s)
            return N = !0, new this(1 / 0);
        r = t;
    } return N = !0, r.sqrt(); }
function mo(e) { return e instanceof qe || e && e.toStringTag === yo || !1; }
function gu(e) { return new this(e).ln(); }
function hu(e, t) { return new this(e).log(t); }
function yu(e) { return new this(e).log(2); }
function wu(e) { return new this(e).log(10); }
function Eu() { return xo(this, arguments, -1); }
function bu() { return xo(this, arguments, 1); }
function xu(e, t) { return new this(e).mod(t); }
function Pu(e, t) { return new this(e).mul(t); }
function vu(e, t) { return new this(e).pow(t); }
function Tu(e) { var t, r, n, i, o = 0, s = new this(1), a = []; if (e === void 0 ? e = this.precision : oe(e, 1, Me), n = Math.ceil(e / D), this.crypto)
    if (crypto.getRandomValues)
        for (t = crypto.getRandomValues(new Uint32Array(n)); o < n;)
            i = t[o], i >= 429e7 ? t[o] = crypto.getRandomValues(new Uint32Array(1))[0] : a[o++] = i % 1e7;
    else if (crypto.randomBytes) {
        for (t = crypto.randomBytes(n *= 4); o < n;)
            i = t[o] + (t[o + 1] << 8) + (t[o + 2] << 16) + ((t[o + 3] & 127) << 24), i >= 214e7 ? crypto.randomBytes(4).copy(t, o) : (a.push(i % 1e7), o += 4);
        o = n / 4;
    }
    else
        throw Error(ho);
else
    for (; o < n;)
        a[o++] = Math.random() * 1e7 | 0; for (n = a[--o], e %= D, n && e && (i = W(10, D - e), a[o] = (n / i | 0) * i); a[o] === 0; o--)
    a.pop(); if (o < 0)
    r = 0, a = [0];
else {
    for (r = -1; a[0] === 0; r -= D)
        a.shift();
    for (n = 1, i = a[0]; i >= 10; i /= 10)
        n++;
    n < D && (r -= D - n);
} return s.e = r, s.d = a, s; }
function Au(e) { return O(e = new this(e), e.e + 1, this.rounding); }
function Cu(e) { return e = new this(e), e.d ? e.d[0] ? e.s : 0 * e.s : e.s || NaN; }
function Ru(e) { return new this(e).sin(); }
function Su(e) { return new this(e).sinh(); }
function ku(e) { return new this(e).sqrt(); }
function Iu(e, t) { return new this(e).sub(t); }
function Ou() { var e = 0, t = arguments, r = new this(t[e]); for (N = !1; r.s && ++e < t.length;)
    r = r.plus(t[e]); return N = !0, O(r, this.precision, this.rounding); }
function Du(e) { return new this(e).tan(); }
function Mu(e) { return new this(e).tanh(); }
function _u(e) { return O(e = new this(e), e.e + 1, 1); }
R[Symbol.for("nodejs.util.inspect.custom")] = R.toString;
R[Symbol.toStringTag] = "Decimal";
var qe = R.constructor = To(In);
xr = new qe(xr);
Pr = new qe(Pr);
var ye = qe;
function rt(e) { return e === null ? e : Array.isArray(e) ? e.map(rt) : typeof e == "object" ? Nu(e) ? Fu(e) : e.constructor !== null && e.constructor.name !== "Object" ? e : Xe(e, rt) : e; }
function Nu(e) { return e !== null && typeof e == "object" && typeof e.$type == "string"; }
function Fu({ $type: e, value: t }) { switch (e) {
    case "BigInt": return BigInt(t);
    case "Bytes": {
        let { buffer: r, byteOffset: n, byteLength: i } = w.Buffer.from(t, "base64");
        return new Uint8Array(r, n, i);
    }
    case "DateTime": return new Date(t);
    case "Decimal": return new ye(t);
    case "Json": return JSON.parse(t);
    default: ve(t, "Unknown tagged value");
} }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var we = class {
    constructor() {
        this._map = new Map;
    }
    get(t) { return this._map.get(t)?.value; }
    set(t, r) { this._map.set(t, { value: r }); }
    getOrCreate(t, r) { let n = this._map.get(t); if (n)
        return n.value; let i = r(); return this.set(t, i), i; }
};
d();
u();
c();
p();
m();
function _e(e) { return e.substring(0, 1).toLowerCase() + e.substring(1); }
d();
u();
c();
p();
m();
function Ao(e, t) { let r = {}; for (let n of e) {
    let i = n[t];
    r[i] = n;
} return r; }
d();
u();
c();
p();
m();
function Ot(e) { let t; return { get() { return t || (t = { value: e() }), t.value; } }; }
d();
u();
c();
p();
m();
function Co(e) { return { models: _n(e.models), enums: _n(e.enums), types: _n(e.types) }; }
function _n(e) { let t = {}; for (let { name: r, ...n } of e)
    t[r] = n; return t; }
d();
u();
c();
p();
m();
function nt(e) { return e instanceof Date || Object.prototype.toString.call(e) === "[object Date]"; }
function Rr(e) { return e.toString() !== "Invalid Date"; }
d();
u();
c();
p();
m();
function it(e) { return qe.isDecimal(e) ? !0 : e !== null && typeof e == "object" && typeof e.s == "number" && typeof e.e == "number" && typeof e.toFixed == "function" && Array.isArray(e.d); }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var Mt = {};
Tt(Mt, { ModelAction: () => Dt, datamodelEnumToSchemaEnum: () => Lu });
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
function Lu(e) { return { name: e.name, values: e.values.map(t => t.name) }; }
d();
u();
c();
p();
m();
var Dt = (I => (I.findUnique = "findUnique", I.findUniqueOrThrow = "findUniqueOrThrow", I.findFirst = "findFirst", I.findFirstOrThrow = "findFirstOrThrow", I.findMany = "findMany", I.create = "create", I.createMany = "createMany", I.createManyAndReturn = "createManyAndReturn", I.update = "update", I.updateMany = "updateMany", I.updateManyAndReturn = "updateManyAndReturn", I.upsert = "upsert", I.delete = "delete", I.deleteMany = "deleteMany", I.groupBy = "groupBy", I.count = "count", I.aggregate = "aggregate", I.findRaw = "findRaw", I.aggregateRaw = "aggregateRaw", I))(Dt || {});
var Uu = Ue(ro());
var Bu = { red: Ye, gray: Vi, dim: dr, bold: mr, underline: Li, highlightSource: e => e.highlight() }, qu = { red: e => e, gray: e => e, dim: e => e, bold: e => e, underline: e => e, highlightSource: e => e };
function $u({ message: e, originalMethod: t, isPanic: r, callArguments: n }) { return { functionName: `prisma.${t}()`, message: e, isPanic: r ?? !1, callArguments: n }; }
function Vu({ functionName: e, location: t, message: r, isPanic: n, contextLines: i, callArguments: o }, s) {
    let a = [""], l = t ? " in" : ":";
    if (n ? (a.push(s.red(`Oops, an unknown error occurred! This is ${s.bold("on us")}, you did nothing wrong.`)), a.push(s.red(`It occurred in the ${s.bold(`\`${e}\``)} invocation${l}`))) : a.push(s.red(`Invalid ${s.bold(`\`${e}\``)} invocation${l}`)), t && a.push(s.underline(ju(t))), i) {
        a.push("");
        let f = [i.toString()];
        o && (f.push(o), f.push(s.dim(")"))), a.push(f.join("")), o && a.push("");
    }
    else
        a.push(""), o && a.push(o), a.push("");
    return a.push(r), a.join(`
`);
}
function ju(e) { let t = [e.fileName]; return e.lineNumber && t.push(String(e.lineNumber)), e.columnNumber && t.push(String(e.columnNumber)), t.join(":"); }
function Sr(e) { let t = e.showColors ? Bu : qu, r; return typeof $getTemplateParameters < "u" ? r = $getTemplateParameters(e, t) : r = $u(e), Vu(r, t); }
d();
u();
c();
p();
m();
var No = Ue(Nn());
d();
u();
c();
p();
m();
function Io(e, t, r) { let n = Oo(e), i = Gu(n), o = Ju(i); o ? kr(o, t, r) : t.addErrorMessage(() => "Unknown error"); }
function Oo(e) { return e.errors.flatMap(t => t.kind === "Union" ? Oo(t) : [t]); }
function Gu(e) { let t = new Map, r = []; for (let n of e) {
    if (n.kind !== "InvalidArgumentType") {
        r.push(n);
        continue;
    }
    let i = `${n.selectionPath.join(".")}:${n.argumentPath.join(".")}`, o = t.get(i);
    o ? t.set(i, { ...n, argument: { ...n.argument, typeNames: Qu(o.argument.typeNames, n.argument.typeNames) } }) : t.set(i, n);
} return r.push(...t.values()), r; }
function Qu(e, t) { return [...new Set(e.concat(t))]; }
function Ju(e) { return Sn(e, (t, r) => { let n = So(t), i = So(r); return n !== i ? n - i : ko(t) - ko(r); }); }
function So(e) { let t = 0; return Array.isArray(e.selectionPath) && (t += e.selectionPath.length), Array.isArray(e.argumentPath) && (t += e.argumentPath.length), t; }
function ko(e) { switch (e.kind) {
    case "InvalidArgumentValue":
    case "ValueTooLarge": return 20;
    case "InvalidArgumentType": return 10;
    case "RequiredArgumentMissing": return -10;
    default: return 0;
} }
d();
u();
c();
p();
m();
var ue = class {
    constructor(t, r) {
        this.isRequired = !1;
        this.name = t;
        this.value = r;
    }
    makeRequired() { return this.isRequired = !0, this; }
    write(t) { let { colors: { green: r } } = t.context; t.addMarginSymbol(r(this.isRequired ? "+" : "?")), t.write(r(this.name)), this.isRequired || t.write(r("?")), t.write(r(": ")), typeof this.value == "string" ? t.write(r(this.value)) : t.write(this.value); }
};
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
Mo();
d();
u();
c();
p();
m();
var ot = class {
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
Do();
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var Ir = class {
    constructor(t) { this.value = t; }
    write(t) { t.write(this.value); }
    markAsError() { this.value.markAsError(); }
};
d();
u();
c();
p();
m();
var Or = e => e, Dr = { bold: Or, red: Or, green: Or, dim: Or, enabled: !1 }, _o = { bold: mr, red: Ye, green: Ui, dim: dr, enabled: !0 }, st = { write(e) { e.writeLine(","); } };
d();
u();
c();
p();
m();
var Ee = class {
    constructor(t) {
        this.isUnderlined = !1;
        this.color = t => t;
        this.contents = t;
    }
    underline() { return this.isUnderlined = !0, this; }
    setColor(t) { return this.color = t, this; }
    write(t) { let r = t.getCurrentLineLength(); t.write(this.color(this.contents)), this.isUnderlined && t.afterNextNewline(() => { t.write(" ".repeat(r)).writeLine(this.color("~".repeat(this.contents.length))); }); }
};
d();
u();
c();
p();
m();
var Ne = class {
    constructor() {
        this.hasError = !1;
    }
    markAsError() { return this.hasError = !0, this; }
};
var at = class extends Ne {
    constructor() {
        super(...arguments);
        this.items = [];
    }
    addItem(t) { return this.items.push(new Ir(t)), this; }
    getField(t) { return this.items[t]; }
    getPrintWidth() { return this.items.length === 0 ? 2 : Math.max(...this.items.map(r => r.value.getPrintWidth())) + 2; }
    write(t) { if (this.items.length === 0) {
        this.writeEmpty(t);
        return;
    } this.writeWithItems(t); }
    writeEmpty(t) { let r = new Ee("[]"); this.hasError && r.setColor(t.context.colors.red).underline(), t.write(r); }
    writeWithItems(t) { let { colors: r } = t.context; t.writeLine("[").withIndent(() => t.writeJoined(st, this.items).newLine()).write("]"), this.hasError && t.afterNextNewline(() => { t.writeLine(r.red("~".repeat(this.getPrintWidth()))); }); }
    asObject() { }
};
var lt = class e extends Ne {
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
        if (o.value instanceof e ? a = o.value.getField(s) : o.value instanceof at && (a = o.value.getField(Number(s))), !a)
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
    writeEmpty(t) { let r = new Ee("{}"); this.hasError && r.setColor(t.context.colors.red).underline(), t.write(r); }
    writeWithContents(t, r) { t.writeLine("{").withIndent(() => { t.writeJoined(st, [...r, ...this.suggestions]).newLine(); }), t.write("}"), this.hasError && t.afterNextNewline(() => { t.writeLine(t.context.colors.red("~".repeat(this.getPrintWidth()))); }); }
};
d();
u();
c();
p();
m();
var H = class extends Ne {
    constructor(r) { super(); this.text = r; }
    getPrintWidth() { return this.text.length; }
    write(r) { let n = new Ee(this.text); this.hasError && n.underline().setColor(r.context.colors.red), r.write(n); }
    asObject() { }
};
d();
u();
c();
p();
m();
var _t = class {
    constructor() {
        this.fields = [];
    }
    addField(t, r) { return this.fields.push({ write(n) { let { green: i, dim: o } = n.context.colors; n.write(i(o(`${t}: ${r}`))).addMarginSymbol(i(o("+"))); } }), this; }
    write(t) { let { colors: { green: r } } = t.context; t.writeLine(r("{")).withIndent(() => { t.writeJoined(st, this.fields).newLine(); }).write(r("}")).addMarginSymbol(r("+")); }
};
function kr(e, t, r) { switch (e.kind) {
    case "MutuallyExclusiveFields":
        Wu(e, t);
        break;
    case "IncludeOnScalar":
        Ku(e, t);
        break;
    case "EmptySelection":
        Hu(e, t, r);
        break;
    case "UnknownSelectionField":
        Xu(e, t);
        break;
    case "InvalidSelectionValue":
        ec(e, t);
        break;
    case "UnknownArgument":
        tc(e, t);
        break;
    case "UnknownInputField":
        rc(e, t);
        break;
    case "RequiredArgumentMissing":
        nc(e, t);
        break;
    case "InvalidArgumentType":
        ic(e, t);
        break;
    case "InvalidArgumentValue":
        oc(e, t);
        break;
    case "ValueTooLarge":
        sc(e, t);
        break;
    case "SomeFieldsMissing":
        ac(e, t);
        break;
    case "TooManyFieldsGiven":
        lc(e, t);
        break;
    case "Union":
        Io(e, t, r);
        break;
    default: throw new Error("not implemented: " + e.kind);
} }
function Wu(e, t) { let r = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); r && (r.getField(e.firstField)?.markAsError(), r.getField(e.secondField)?.markAsError()), t.addErrorMessage(n => `Please ${n.bold("either")} use ${n.green(`\`${e.firstField}\``)} or ${n.green(`\`${e.secondField}\``)}, but ${n.red("not both")} at the same time.`); }
function Ku(e, t) {
    let [r, n] = ut(e.selectionPath), i = e.outputType, o = t.arguments.getDeepSelectionParent(r)?.value;
    if (o && (o.getField(n)?.markAsError(), i))
        for (let s of i.fields)
            s.isRelation && o.addSuggestion(new ue(s.name, "true"));
    t.addErrorMessage(s => {
        let a = `Invalid scalar field ${s.red(`\`${n}\``)} for ${s.bold("include")} statement`;
        return i ? a += ` on model ${s.bold(i.name)}. ${Nt(s)}` : a += ".", a += `
Note that ${s.bold("include")} statements only accept relation fields.`, a;
    });
}
function Hu(e, t, r) { let n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); if (n) {
    let i = n.getField("omit")?.value.asObject();
    if (i) {
        zu(e, t, i);
        return;
    }
    if (n.hasField("select")) {
        Yu(e, t);
        return;
    }
} if (r?.[_e(e.outputType.name)]) {
    Zu(e, t);
    return;
} t.addErrorMessage(() => `Unknown field at "${e.selectionPath.join(".")} selection"`); }
function zu(e, t, r) { r.removeAllFields(); for (let n of e.outputType.fields)
    r.addSuggestion(new ue(n.name, "false")); t.addErrorMessage(n => `The ${n.red("omit")} statement includes every field of the model ${n.bold(e.outputType.name)}. At least one field must be included in the result`); }
function Yu(e, t) { let r = e.outputType, n = t.arguments.getDeepSelectionParent(e.selectionPath)?.value, i = n?.isEmpty() ?? !1; n && (n.removeAllFields(), Uo(n, r)), t.addErrorMessage(o => i ? `The ${o.red("`select`")} statement for type ${o.bold(r.name)} must not be empty. ${Nt(o)}` : `The ${o.red("`select`")} statement for type ${o.bold(r.name)} needs ${o.bold("at least one truthy value")}.`); }
function Zu(e, t) { let r = new _t; for (let i of e.outputType.fields)
    i.isRelation || r.addField(i.name, "false"); let n = new ue("omit", r).makeRequired(); if (e.selectionPath.length === 0)
    t.arguments.addSuggestion(n);
else {
    let [i, o] = ut(e.selectionPath), a = t.arguments.getDeepSelectionParent(i)?.value.asObject()?.getField(o);
    if (a) {
        let l = a?.value.asObject() ?? new lt;
        l.addSuggestion(n), a.value = l;
    }
} t.addErrorMessage(i => `The global ${i.red("omit")} configuration excludes every field of the model ${i.bold(e.outputType.name)}. At least one field must be included in the result`); }
function Xu(e, t) { let r = Bo(e.selectionPath, t); if (r.parentKind !== "unknown") {
    r.field.markAsError();
    let n = r.parent;
    switch (r.parentKind) {
        case "select":
            Uo(n, e.outputType);
            break;
        case "include":
            uc(n, e.outputType);
            break;
        case "omit":
            cc(n, e.outputType);
            break;
    }
} t.addErrorMessage(n => { let i = [`Unknown field ${n.red(`\`${r.fieldName}\``)}`]; return r.parentKind !== "unknown" && i.push(`for ${n.bold(r.parentKind)} statement`), i.push(`on model ${n.bold(`\`${e.outputType.name}\``)}.`), i.push(Nt(n)), i.join(" "); }); }
function ec(e, t) { let r = Bo(e.selectionPath, t); r.parentKind !== "unknown" && r.field.value.markAsError(), t.addErrorMessage(n => `Invalid value for selection field \`${n.red(r.fieldName)}\`: ${e.underlyingError}`); }
function tc(e, t) { let r = e.argumentPath[0], n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); n && (n.getField(r)?.markAsError(), pc(n, e.arguments)), t.addErrorMessage(i => Fo(i, r, e.arguments.map(o => o.name))); }
function rc(e, t) { let [r, n] = ut(e.argumentPath), i = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); if (i) {
    i.getDeepField(e.argumentPath)?.markAsError();
    let o = i.getDeepFieldValue(r)?.asObject();
    o && qo(o, e.inputType);
} t.addErrorMessage(o => Fo(o, n, e.inputType.fields.map(s => s.name))); }
function Fo(e, t, r) { let n = [`Unknown argument \`${e.red(t)}\`.`], i = dc(t, r); return i && n.push(`Did you mean \`${e.green(i)}\`?`), r.length > 0 && n.push(Nt(e)), n.join(" "); }
function nc(e, t) { let r; t.addErrorMessage(l => r?.value instanceof H && r.value.text === "null" ? `Argument \`${l.green(o)}\` must not be ${l.red("null")}.` : `Argument \`${l.green(o)}\` is missing.`); let n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); if (!n)
    return; let [i, o] = ut(e.argumentPath), s = new _t, a = n.getDeepFieldValue(i)?.asObject(); if (a) {
    if (r = a.getField(o), r && a.removeField(o), e.inputTypes.length === 1 && e.inputTypes[0].kind === "object") {
        for (let l of e.inputTypes[0].fields)
            s.addField(l.name, l.typeNames.join(" | "));
        a.addSuggestion(new ue(o, s).makeRequired());
    }
    else {
        let l = e.inputTypes.map(Lo).join(" | ");
        a.addSuggestion(new ue(o, l).makeRequired());
    }
    if (e.dependentArgumentPath) {
        n.getDeepField(e.dependentArgumentPath)?.markAsError();
        let [, l] = ut(e.dependentArgumentPath);
        t.addErrorMessage(f => `Argument \`${f.green(o)}\` is required because argument \`${f.green(l)}\` was provided.`);
    }
} }
function Lo(e) { return e.kind === "list" ? `${Lo(e.elementType)}[]` : e.name; }
function ic(e, t) { let r = e.argument.name, n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); n && n.getDeepFieldValue(e.argumentPath)?.markAsError(), t.addErrorMessage(i => { let o = Mr("or", e.argument.typeNames.map(s => i.green(s))); return `Argument \`${i.bold(r)}\`: Invalid value provided. Expected ${o}, provided ${i.red(e.inferredType)}.`; }); }
function oc(e, t) { let r = e.argument.name, n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); n && n.getDeepFieldValue(e.argumentPath)?.markAsError(), t.addErrorMessage(i => { let o = [`Invalid value for argument \`${i.bold(r)}\``]; if (e.underlyingError && o.push(`: ${e.underlyingError}`), o.push("."), e.argument.typeNames.length > 0) {
    let s = Mr("or", e.argument.typeNames.map(a => i.green(a)));
    o.push(` Expected ${s}.`);
} return o.join(""); }); }
function sc(e, t) { let r = e.argument.name, n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(), i; if (n) {
    let s = n.getDeepField(e.argumentPath)?.value;
    s?.markAsError(), s instanceof H && (i = s.text);
} t.addErrorMessage(o => { let s = ["Unable to fit value"]; return i && s.push(o.red(i)), s.push(`into a 64-bit signed integer for field \`${o.bold(r)}\``), s.join(" "); }); }
function ac(e, t) { let r = e.argumentPath[e.argumentPath.length - 1], n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(); if (n) {
    let i = n.getDeepFieldValue(e.argumentPath)?.asObject();
    i && qo(i, e.inputType);
} t.addErrorMessage(i => { let o = [`Argument \`${i.bold(r)}\` of type ${i.bold(e.inputType.name)} needs`]; return e.constraints.minFieldCount === 1 ? e.constraints.requiredFields ? o.push(`${i.green("at least one of")} ${Mr("or", e.constraints.requiredFields.map(s => `\`${i.bold(s)}\``))} arguments.`) : o.push(`${i.green("at least one")} argument.`) : o.push(`${i.green(`at least ${e.constraints.minFieldCount}`)} arguments.`), o.push(Nt(i)), o.join(" "); }); }
function lc(e, t) { let r = e.argumentPath[e.argumentPath.length - 1], n = t.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(), i = []; if (n) {
    let o = n.getDeepFieldValue(e.argumentPath)?.asObject();
    o && (o.markAsError(), i = Object.keys(o.getFields()));
} t.addErrorMessage(o => { let s = [`Argument \`${o.bold(r)}\` of type ${o.bold(e.inputType.name)} needs`]; return e.constraints.minFieldCount === 1 && e.constraints.maxFieldCount == 1 ? s.push(`${o.green("exactly one")} argument,`) : e.constraints.maxFieldCount == 1 ? s.push(`${o.green("at most one")} argument,`) : s.push(`${o.green(`at most ${e.constraints.maxFieldCount}`)} arguments,`), s.push(`but you provided ${Mr("and", i.map(a => o.red(a)))}. Please choose`), e.constraints.maxFieldCount === 1 ? s.push("one.") : s.push(`${e.constraints.maxFieldCount}.`), s.join(" "); }); }
function Uo(e, t) { for (let r of t.fields)
    e.hasField(r.name) || e.addSuggestion(new ue(r.name, "true")); }
function uc(e, t) { for (let r of t.fields)
    r.isRelation && !e.hasField(r.name) && e.addSuggestion(new ue(r.name, "true")); }
function cc(e, t) { for (let r of t.fields)
    !e.hasField(r.name) && !r.isRelation && e.addSuggestion(new ue(r.name, "true")); }
function pc(e, t) { for (let r of t)
    e.hasField(r.name) || e.addSuggestion(new ue(r.name, r.typeNames.join(" | "))); }
function Bo(e, t) { let [r, n] = ut(e), i = t.arguments.getDeepSubSelectionValue(r)?.asObject(); if (!i)
    return { parentKind: "unknown", fieldName: n }; let o = i.getFieldValue("select")?.asObject(), s = i.getFieldValue("include")?.asObject(), a = i.getFieldValue("omit")?.asObject(), l = o?.getField(n); return o && l ? { parentKind: "select", parent: o, field: l, fieldName: n } : (l = s?.getField(n), s && l ? { parentKind: "include", field: l, parent: s, fieldName: n } : (l = a?.getField(n), a && l ? { parentKind: "omit", field: l, parent: a, fieldName: n } : { parentKind: "unknown", fieldName: n })); }
function qo(e, t) { if (t.kind === "object")
    for (let r of t.fields)
        e.hasField(r.name) || e.addSuggestion(new ue(r.name, r.typeNames.join(" | "))); }
function ut(e) { let t = [...e], r = t.pop(); if (!r)
    throw new Error("unexpected empty path"); return [t, r]; }
function Nt({ green: e, enabled: t }) { return "Available options are " + (t ? `listed in ${e("green")}` : "marked with ?") + "."; }
function Mr(e, t) { if (t.length === 1)
    return t[0]; let r = [...t], n = r.pop(); return `${r.join(", ")} ${e} ${n}`; }
var mc = 3;
function dc(e, t) { let r = 1 / 0, n; for (let i of t) {
    let o = (0, No.default)(e, i);
    o > mc || o < r && (r = o, n = i);
} return n; }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var Ft = class {
    constructor(t, r, n, i, o) { this.modelName = t, this.name = r, this.typeName = n, this.isList = i, this.isEnum = o; }
    _toGraphQLInputType() { let t = this.isList ? "List" : "", r = this.isEnum ? "Enum" : ""; return `${t}${r}${this.typeName}FieldRefInput<${this.modelName}>`; }
};
function ct(e) { return e instanceof Ft; }
d();
u();
c();
p();
m();
var _r = Symbol(), Ln = new WeakMap, Ce = class {
    constructor(t) { t === _r ? Ln.set(this, `Prisma.${this._getName()}`) : Ln.set(this, `new Prisma.${this._getNamespace()}.${this._getName()}()`); }
    _getName() { return this.constructor.name; }
    toString() { return Ln.get(this); }
}, Lt = class extends Ce {
    _getNamespace() { return "NullTypes"; }
}, Ut = (_b = class extends Lt {
        constructor() {
            super(...arguments);
            _Ut_e.set(this, void 0);
        }
    },
    _Ut_e = new WeakMap(),
    _b);
Un(Ut, "DbNull");
var Bt = (_f = class extends Lt {
        constructor() {
            super(...arguments);
            _Bt_e.set(this, void 0);
        }
    },
    _Bt_e = new WeakMap(),
    _f);
Un(Bt, "JsonNull");
var qt = (_g = class extends Lt {
        constructor() {
            super(...arguments);
            _qt_e.set(this, void 0);
        }
    },
    _qt_e = new WeakMap(),
    _g);
Un(qt, "AnyNull");
var Nr = { classes: { DbNull: Ut, JsonNull: Bt, AnyNull: qt }, instances: { DbNull: new Ut(_r), JsonNull: new Bt(_r), AnyNull: new qt(_r) } };
function Un(e, t) { Object.defineProperty(e, "name", { value: t, configurable: !0 }); }
d();
u();
c();
p();
m();
var $o = ": ", Fr = class {
    constructor(t, r) {
        this.hasError = !1;
        this.name = t;
        this.value = r;
    }
    markAsError() { this.hasError = !0; }
    getPrintWidth() { return this.name.length + this.value.getPrintWidth() + $o.length; }
    write(t) { let r = new Ee(this.name); this.hasError && r.underline().setColor(t.context.colors.red), t.write(r).write($o).write(this.value); }
};
var Bn = class {
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
function pt(e) { return new Bn(Vo(e)); }
function Vo(e) { let t = new lt; for (let [r, n] of Object.entries(e)) {
    let i = new Fr(r, jo(n));
    t.addField(i);
} return t; }
function jo(e) { if (typeof e == "string")
    return new H(JSON.stringify(e)); if (typeof e == "number" || typeof e == "boolean")
    return new H(String(e)); if (typeof e == "bigint")
    return new H(`${e}n`); if (e === null)
    return new H("null"); if (e === void 0)
    return new H("undefined"); if (it(e))
    return new H(`new Prisma.Decimal("${e.toFixed()}")`); if (e instanceof Uint8Array)
    return w.Buffer.isBuffer(e) ? new H(`Buffer.alloc(${e.byteLength})`) : new H(`new Uint8Array(${e.byteLength})`); if (e instanceof Date) {
    let t = Rr(e) ? e.toISOString() : "Invalid Date";
    return new H(`new Date("${t}")`);
} return e instanceof Ce ? new H(`Prisma.${e._getName()}`) : ct(e) ? new H(`prisma.${_e(e.modelName)}.$fields.${e.name}`) : Array.isArray(e) ? fc(e) : typeof e == "object" ? Vo(e) : new H(Object.prototype.toString.call(e)); }
function fc(e) { let t = new at; for (let r of e)
    t.addItem(jo(r)); return t; }
function Lr(e, t) { let r = t === "pretty" ? _o : Dr, n = e.renderAllMessages(r), i = new ot(0, { colors: r }).write(e).toString(); return { message: n, args: i }; }
function Ur({ args: e, errors: t, errorFormat: r, callsite: n, originalMethod: i, clientVersion: o, globalOmit: s }) { let a = pt(e); for (let h of t)
    kr(h, a, s); let { message: l, args: f } = Lr(a, r), g = Sr({ message: l, callsite: n, originalMethod: i, showColors: r === "pretty", callArguments: f }); throw new X(g, { clientVersion: o }); }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
function be(e) { return e.replace(/^./, t => t.toLowerCase()); }
d();
u();
c();
p();
m();
function Qo(e, t, r) { let n = be(r); return !t.result || !(t.result.$allModels || t.result[n]) ? e : gc({ ...e, ...Go(t.name, e, t.result.$allModels), ...Go(t.name, e, t.result[n]) }); }
function gc(e) { let t = new we, r = (n, i) => t.getOrCreate(n, () => i.has(n) ? [n] : (i.add(n), e[n] ? e[n].needs.flatMap(o => r(o, i)) : [n])); return Xe(e, n => ({ ...n, needs: r(n.name, new Set) })); }
function Go(e, t, r) { return r ? Xe(r, ({ needs: n, compute: i }, o) => ({ name: o, needs: n ? Object.keys(n).filter(s => n[s]) : [], compute: hc(t, o, i) })) : {}; }
function hc(e, t, r) { let n = e?.[t]?.compute; return n ? i => r({ ...i, [t]: n(i) }) : r; }
function Jo(e, t) { if (!t)
    return e; let r = { ...e }; for (let n of Object.values(t))
    if (e[n.name])
        for (let i of n.needs)
            r[i] = !0; return r; }
function Wo(e, t) { if (!t)
    return e; let r = { ...e }; for (let n of Object.values(t))
    if (!e[n.name])
        for (let i of n.needs)
            delete r[i]; return r; }
var Br = class {
    constructor(t, r) {
        this.computedFieldsCache = new we;
        this.modelExtensionsCache = new we;
        this.queryCallbacksCache = new we;
        this.clientExtensions = Ot(() => this.extension.client ? { ...this.previous?.getAllClientExtensions(), ...this.extension.client } : this.previous?.getAllClientExtensions());
        this.batchCallbacks = Ot(() => { let t = this.previous?.getAllBatchQueryCallbacks() ?? [], r = this.extension.query?.$__internalBatch; return r ? t.concat(r) : t; });
        this.extension = t;
        this.previous = r;
    }
    getAllComputedFields(t) { return this.computedFieldsCache.getOrCreate(t, () => Qo(this.previous?.getAllComputedFields(t), this.extension, t)); }
    getAllClientExtensions() { return this.clientExtensions.get(); }
    getAllModelExtensions(t) { return this.modelExtensionsCache.getOrCreate(t, () => { let r = be(t); return !this.extension.model || !(this.extension.model[r] || this.extension.model.$allModels) ? this.previous?.getAllModelExtensions(t) : { ...this.previous?.getAllModelExtensions(t), ...this.extension.model.$allModels, ...this.extension.model[r] }; }); }
    getAllQueryCallbacks(t, r) { return this.queryCallbacksCache.getOrCreate(`${t}:${r}`, () => { let n = this.previous?.getAllQueryCallbacks(t, r) ?? [], i = [], o = this.extension.query; return !o || !(o[t] || o.$allModels || o[r] || o.$allOperations) ? n : (o[t] !== void 0 && (o[t][r] !== void 0 && i.push(o[t][r]), o[t].$allOperations !== void 0 && i.push(o[t].$allOperations)), t !== "$none" && o.$allModels !== void 0 && (o.$allModels[r] !== void 0 && i.push(o.$allModels[r]), o.$allModels.$allOperations !== void 0 && i.push(o.$allModels.$allOperations)), o[r] !== void 0 && i.push(o[r]), o.$allOperations !== void 0 && i.push(o.$allOperations), n.concat(i)); }); }
    getAllBatchQueryCallbacks() { return this.batchCallbacks.get(); }
}, mt = class e {
    constructor(t) { this.head = t; }
    static empty() { return new e; }
    static single(t) { return new e(new Br(t)); }
    isEmpty() { return this.head === void 0; }
    append(t) { return new e(new Br(t, this.head)); }
    getAllComputedFields(t) { return this.head?.getAllComputedFields(t); }
    getAllClientExtensions() { return this.head?.getAllClientExtensions(); }
    getAllModelExtensions(t) { return this.head?.getAllModelExtensions(t); }
    getAllQueryCallbacks(t, r) { return this.head?.getAllQueryCallbacks(t, r) ?? []; }
    getAllBatchQueryCallbacks() { return this.head?.getAllBatchQueryCallbacks() ?? []; }
};
d();
u();
c();
p();
m();
var qr = class {
    constructor(t) { this.name = t; }
};
function Ko(e) { return e instanceof qr; }
function Ho(e) { return new qr(e); }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var zo = Symbol(), $t = class {
    constructor(t) { if (t !== zo)
        throw new Error("Skip instance can not be constructed directly"); }
    ifUndefined(t) { return t === void 0 ? $r : t; }
}, $r = new $t(zo);
function xe(e) { return e instanceof $t; }
var yc = { findUnique: "findUnique", findUniqueOrThrow: "findUniqueOrThrow", findFirst: "findFirst", findFirstOrThrow: "findFirstOrThrow", findMany: "findMany", count: "aggregate", create: "createOne", createMany: "createMany", createManyAndReturn: "createManyAndReturn", update: "updateOne", updateMany: "updateMany", updateManyAndReturn: "updateManyAndReturn", upsert: "upsertOne", delete: "deleteOne", deleteMany: "deleteMany", executeRaw: "executeRaw", queryRaw: "queryRaw", aggregate: "aggregate", groupBy: "groupBy", runCommandRaw: "runCommandRaw", findRaw: "findRaw", aggregateRaw: "aggregateRaw" }, Yo = "explicitly `undefined` values are not allowed";
function Vr({ modelName: e, action: t, args: r, runtimeDataModel: n, extensions: i = mt.empty(), callsite: o, clientMethod: s, errorFormat: a, clientVersion: l, previewFeatures: f, globalOmit: g }) { let h = new qn({ runtimeDataModel: n, modelName: e, action: t, rootArgs: r, callsite: o, extensions: i, selectionPath: [], argumentPath: [], originalMethod: s, errorFormat: a, clientVersion: l, previewFeatures: f, globalOmit: g }); return { modelName: e, action: yc[t], query: Vt(r, h) }; }
function Vt({ select: e, include: t, ...r } = {}, n) { let i = r.omit; return delete r.omit, { arguments: Xo(r, n), selection: wc(e, t, i, n) }; }
function wc(e, t, r, n) { return e ? (t ? n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "include", secondField: "select", selectionPath: n.getSelectionPath() }) : r && n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "omit", secondField: "select", selectionPath: n.getSelectionPath() }), Pc(e, n)) : Ec(n, t, r); }
function Ec(e, t, r) { let n = {}; return e.modelOrType && !e.isRawAction() && (n.$composites = !0, n.$scalars = !0), t && bc(n, t, e), xc(n, r, e), n; }
function bc(e, t, r) { for (let [n, i] of Object.entries(t)) {
    if (xe(i))
        continue;
    let o = r.nestSelection(n);
    if ($n(i, o), i === !1 || i === void 0) {
        e[n] = !1;
        continue;
    }
    let s = r.findField(n);
    if (s && s.kind !== "object" && r.throwValidationError({ kind: "IncludeOnScalar", selectionPath: r.getSelectionPath().concat(n), outputType: r.getOutputTypeDescription() }), s) {
        e[n] = Vt(i === !0 ? {} : i, o);
        continue;
    }
    if (i === !0) {
        e[n] = !0;
        continue;
    }
    e[n] = Vt(i, o);
} }
function xc(e, t, r) { let n = r.getComputedFields(), i = { ...r.getGlobalOmit(), ...t }, o = Wo(i, n); for (let [s, a] of Object.entries(o)) {
    if (xe(a))
        continue;
    $n(a, r.nestSelection(s));
    let l = r.findField(s);
    n?.[s] && !l || (e[s] = !a);
} }
function Pc(e, t) { let r = {}, n = t.getComputedFields(), i = Jo(e, n); for (let [o, s] of Object.entries(i)) {
    if (xe(s))
        continue;
    let a = t.nestSelection(o);
    $n(s, a);
    let l = t.findField(o);
    if (!(n?.[o] && !l)) {
        if (s === !1 || s === void 0 || xe(s)) {
            r[o] = !1;
            continue;
        }
        if (s === !0) {
            l?.kind === "object" ? r[o] = Vt({}, a) : r[o] = !0;
            continue;
        }
        r[o] = Vt(s, a);
    }
} return r; }
function Zo(e, t) { if (e === null)
    return null; if (typeof e == "string" || typeof e == "number" || typeof e == "boolean")
    return e; if (typeof e == "bigint")
    return { $type: "BigInt", value: String(e) }; if (nt(e)) {
    if (Rr(e))
        return { $type: "DateTime", value: e.toISOString() };
    t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: t.getSelectionPath(), argumentPath: t.getArgumentPath(), argument: { name: t.getArgumentName(), typeNames: ["Date"] }, underlyingError: "Provided Date object is invalid" });
} if (Ko(e))
    return { $type: "Param", value: e.name }; if (ct(e))
    return { $type: "FieldRef", value: { _ref: e.name, _container: e.modelName } }; if (Array.isArray(e))
    return vc(e, t); if (ArrayBuffer.isView(e)) {
    let { buffer: r, byteOffset: n, byteLength: i } = e;
    return { $type: "Bytes", value: w.Buffer.from(r, n, i).toString("base64") };
} if (Tc(e))
    return e.values; if (it(e))
    return { $type: "Decimal", value: e.toFixed() }; if (e instanceof Ce) {
    if (e !== Nr.instances[e._getName()])
        throw new Error("Invalid ObjectEnumValue");
    return { $type: "Enum", value: e._getName() };
} if (Ac(e))
    return e.toJSON(); if (typeof e == "object")
    return Xo(e, t); t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: t.getSelectionPath(), argumentPath: t.getArgumentPath(), argument: { name: t.getArgumentName(), typeNames: [] }, underlyingError: `We could not serialize ${Object.prototype.toString.call(e)} value. Serialize the object to JSON or implement a ".toJSON()" method on it` }); }
function Xo(e, t) { if (e.$type)
    return { $type: "Raw", value: e }; let r = {}; for (let n in e) {
    let i = e[n], o = t.nestArgument(n);
    xe(i) || (i !== void 0 ? r[n] = Zo(i, o) : t.isPreviewFeatureOn("strictUndefinedChecks") && t.throwValidationError({ kind: "InvalidArgumentValue", argumentPath: o.getArgumentPath(), selectionPath: t.getSelectionPath(), argument: { name: t.getArgumentName(), typeNames: [] }, underlyingError: Yo }));
} return r; }
function vc(e, t) { let r = []; for (let n = 0; n < e.length; n++) {
    let i = t.nestArgument(String(n)), o = e[n];
    if (o === void 0 || xe(o)) {
        let s = o === void 0 ? "undefined" : "Prisma.skip";
        t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: i.getSelectionPath(), argumentPath: i.getArgumentPath(), argument: { name: `${t.getArgumentName()}[${n}]`, typeNames: [] }, underlyingError: `Can not use \`${s}\` value within array. Use \`null\` or filter out \`${s}\` values` });
    }
    r.push(Zo(o, i));
} return r; }
function Tc(e) { return typeof e == "object" && e !== null && e.__prismaRawParameters__ === !0; }
function Ac(e) { return typeof e == "object" && e !== null && typeof e.toJSON == "function"; }
function $n(e, t) { e === void 0 && t.isPreviewFeatureOn("strictUndefinedChecks") && t.throwValidationError({ kind: "InvalidSelectionValue", selectionPath: t.getSelectionPath(), underlyingError: Yo }); }
var qn = class e {
    constructor(t) { this.params = t; this.params.modelName && (this.modelOrType = this.params.runtimeDataModel.models[this.params.modelName] ?? this.params.runtimeDataModel.types[this.params.modelName]); }
    throwValidationError(t) { Ur({ errors: [t], originalMethod: this.params.originalMethod, args: this.params.rootArgs ?? {}, callsite: this.params.callsite, errorFormat: this.params.errorFormat, clientVersion: this.params.clientVersion, globalOmit: this.params.globalOmit }); }
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
    getGlobalOmit() { return this.params.modelName && this.shouldApplyGlobalOmit() ? this.params.globalOmit?.[_e(this.params.modelName)] ?? {} : {}; }
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
        default: ve(this.params.action, "Unknown action");
    } }
    nestArgument(t) { return new e({ ...this.params, argumentPath: this.params.argumentPath.concat(t) }); }
};
d();
u();
c();
p();
m();
function es(e) { if (!e._hasPreviewFlag("metrics"))
    throw new X("`metrics` preview feature must be enabled in order to access metrics API", { clientVersion: e._clientVersion }); }
var dt = class {
    constructor(t) { this._client = t; }
    prometheus(t) { return es(this._client), this._client._engine.metrics({ format: "prometheus", ...t }); }
    json(t) { return es(this._client), this._client._engine.metrics({ format: "json", ...t }); }
};
d();
u();
c();
p();
m();
function ts(e, t) { let r = Ot(() => Cc(t)); Object.defineProperty(e, "dmmf", { get: () => r.get() }); }
function Cc(e) { return { datamodel: { models: Vn(e.models), enums: Vn(e.enums), types: Vn(e.types) } }; }
function Vn(e) { return Object.entries(e).map(([t, r]) => ({ name: t, ...r })); }
d();
u();
c();
p();
m();
var jn = new WeakMap, jr = "$$PrismaTypedSql", jt = class {
    constructor(t, r) { jn.set(this, { sql: t, values: r }), Object.defineProperty(this, jr, { value: jr }); }
    get sql() { return jn.get(this).sql; }
    get values() { return jn.get(this).values; }
};
function rs(e) { return (...t) => new jt(e, t); }
function Gr(e) { return e != null && e[jr] === jr; }
d();
u();
c();
p();
m();
var Ea = Ue(Tn());
d();
u();
c();
p();
m();
ns();
Wi();
Yi();
d();
u();
c();
p();
m();
var se = class e {
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
function is(e, t = ",", r = "", n = "") { if (e.length === 0)
    throw new TypeError("Expected `join([])` to be called with an array of multiple elements, but got an empty array"); return new se([r, ...Array(e.length - 1).fill(t), n], e); }
function Gn(e) { return new se([e], []); }
var os = Gn("");
function Qn(e, ...t) { return new se(e, t); }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
function Gt(e) { return { getKeys() { return Object.keys(e); }, getPropertyValue(t) { return e[t]; } }; }
d();
u();
c();
p();
m();
function te(e, t) { return { getKeys() { return [e]; }, getPropertyValue() { return t(); } }; }
d();
u();
c();
p();
m();
function $e(e) { let t = new we; return { getKeys() { return e.getKeys(); }, getPropertyValue(r) { return t.getOrCreate(r, () => e.getPropertyValue(r)); }, getPropertyDescriptor(r) { return e.getPropertyDescriptor?.(r); } }; }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var Jr = { enumerable: !0, configurable: !0, writable: !0 };
function Wr(e) { let t = new Set(e); return { getPrototypeOf: () => Object.prototype, getOwnPropertyDescriptor: () => Jr, has: (r, n) => t.has(n), set: (r, n, i) => t.add(n) && Reflect.set(r, n, i), ownKeys: () => [...t] }; }
var ss = Symbol.for("nodejs.util.inspect.custom");
function me(e, t) { let r = Rc(t), n = new Set, i = new Proxy(e, { get(o, s) { if (n.has(s))
        return o[s]; let a = r.get(s); return a ? a.getPropertyValue(s) : o[s]; }, has(o, s) { if (n.has(s))
        return !0; let a = r.get(s); return a ? a.has?.(s) ?? !0 : Reflect.has(o, s); }, ownKeys(o) { let s = as(Reflect.ownKeys(o), r), a = as(Array.from(r.keys()), r); return [...new Set([...s, ...a, ...n])]; }, set(o, s, a) { return r.get(s)?.getPropertyDescriptor?.(s)?.writable === !1 ? !1 : (n.add(s), Reflect.set(o, s, a)); }, getOwnPropertyDescriptor(o, s) { let a = Reflect.getOwnPropertyDescriptor(o, s); if (a && !a.configurable)
        return a; let l = r.get(s); return l ? l.getPropertyDescriptor ? { ...Jr, ...l?.getPropertyDescriptor(s) } : Jr : a; }, defineProperty(o, s, a) { return n.add(s), Reflect.defineProperty(o, s, a); }, getPrototypeOf: () => Object.prototype }); return i[ss] = function () { let o = { ...this }; return delete o[ss], o; }, i; }
function Rc(e) { let t = new Map; for (let r of e) {
    let n = r.getKeys();
    for (let i of n)
        t.set(i, r);
} return t; }
function as(e, t) { return e.filter(r => t.get(r)?.has?.(r) ?? !0); }
d();
u();
c();
p();
m();
function ft(e) { return { getKeys() { return e; }, has() { return !1; }, getPropertyValue() { } }; }
d();
u();
c();
p();
m();
function Kr(e, t) { return { batch: e, transaction: t?.kind === "batch" ? { isolationLevel: t.options.isolationLevel } : void 0 }; }
d();
u();
c();
p();
m();
function ls(e) { if (e === void 0)
    return ""; let t = pt(e); return new ot(0, { colors: Dr }).write(t).toString(); }
d();
u();
c();
p();
m();
var Sc = "P2037";
function Hr({ error: e, user_facing_error: t }, r, n) { return t.error_code ? new ne(kc(t, n), { code: t.error_code, clientVersion: r, meta: t.meta, batchRequestIdx: t.batch_request_idx }) : new ie(e, { clientVersion: r, batchRequestIdx: t.batch_request_idx }); }
function kc(e, t) {
    let r = e.message;
    return (t === "postgresql" || t === "postgres" || t === "mysql") && e.error_code === Sc && (r += `
Prisma Accelerate has built-in connection pooling to prevent such errors: https://pris.ly/client/error-accelerate`), r;
}
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var Jn = class {
    getLocation() { return null; }
};
function Fe(e) { return typeof $EnabledCallSite == "function" && e !== "minimal" ? new $EnabledCallSite : new Jn; }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var us = { _avg: !0, _count: !0, _sum: !0, _min: !0, _max: !0 };
function gt(e = {}) { let t = Oc(e); return Object.entries(t).reduce((n, [i, o]) => (us[i] !== void 0 ? n.select[i] = { select: o } : n[i] = o, n), { select: {} }); }
function Oc(e = {}) { return typeof e._count == "boolean" ? { ...e, _count: { _all: e._count } } : e; }
function zr(e = {}) { return t => (typeof e._count == "boolean" && (t._count = t._count._all), t); }
function cs(e, t) { let r = zr(e); return t({ action: "aggregate", unpacker: r, argsMapper: gt })(e); }
d();
u();
c();
p();
m();
function Dc(e = {}) { let { select: t, ...r } = e; return typeof t == "object" ? gt({ ...r, _count: t }) : gt({ ...r, _count: { _all: !0 } }); }
function Mc(e = {}) { return typeof e.select == "object" ? t => zr(e)(t)._count : t => zr(e)(t)._count._all; }
function ps(e, t) { return t({ action: "count", unpacker: Mc(e), argsMapper: Dc })(e); }
d();
u();
c();
p();
m();
function _c(e = {}) { let t = gt(e); if (Array.isArray(t.by))
    for (let r of t.by)
        typeof r == "string" && (t.select[r] = !0);
else
    typeof t.by == "string" && (t.select[t.by] = !0); return t; }
function Nc(e = {}) { return t => (typeof e?._count == "boolean" && t.forEach(r => { r._count = r._count._all; }), t); }
function ms(e, t) { return t({ action: "groupBy", unpacker: Nc(e), argsMapper: _c })(e); }
function ds(e, t, r) { if (t === "aggregate")
    return n => cs(n, r); if (t === "count")
    return n => ps(n, r); if (t === "groupBy")
    return n => ms(n, r); }
d();
u();
c();
p();
m();
function fs(e, t) { let r = t.fields.filter(i => !i.relationName), n = Ao(r, "name"); return new Proxy({}, { get(i, o) { if (o in i || typeof o == "symbol")
        return i[o]; let s = n[o]; if (s)
        return new Ft(e, o, s.type, s.isList, s.kind === "enum"); }, ...Wr(Object.keys(n)) }); }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var gs = e => Array.isArray(e) ? e : e.split("."), Wn = (e, t) => gs(t).reduce((r, n) => r && r[n], e), hs = (e, t, r) => gs(t).reduceRight((n, i, o, s) => Object.assign({}, Wn(e, s.slice(0, o)), { [i]: n }), r);
function Fc(e, t) { return e === void 0 || t === void 0 ? [] : [...t, "select", e]; }
function Lc(e, t, r) { return t === void 0 ? e ?? {} : hs(t, r, e || !0); }
function Kn(e, t, r, n, i, o) { let a = e._runtimeDataModel.models[t].fields.reduce((l, f) => ({ ...l, [f.name]: f }), {}); return l => { let f = Fe(e._errorFormat), g = Fc(n, i), h = Lc(l, o, g), T = r({ dataPath: g, callsite: f })(h), k = Uc(e, t); return new Proxy(T, { get(C, S) { if (!k.includes(S))
        return C[S]; let _ = [a[S].type, r, S], B = [g, h]; return Kn(e, ..._, ...B); }, ...Wr([...k, ...Object.getOwnPropertyNames(T)]) }); }; }
function Uc(e, t) { return e._runtimeDataModel.models[t].fields.filter(r => r.kind === "object").map(r => r.name); }
var Bc = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "create", "update", "upsert", "delete"], qc = ["aggregate", "count", "groupBy"];
function Hn(e, t) { let r = e._extensions.getAllModelExtensions(t) ?? {}, n = [$c(e, t), jc(e, t), Gt(r), te("name", () => t), te("$name", () => t), te("$parent", () => e._appliedParent)]; return me({}, n); }
function $c(e, t) { let r = be(t), n = Object.keys(Dt).concat("count"); return { getKeys() { return n; }, getPropertyValue(i) { let o = i, s = a => l => { let f = Fe(e._errorFormat); return e._createPrismaPromise(g => { let h = { args: l, dataPath: [], action: o, model: t, clientMethod: `${r}.${i}`, jsModelName: r, transaction: g, callsite: f }; return e._request({ ...h, ...a }); }, { action: o, args: l, model: t }); }; return Bc.includes(o) ? Kn(e, t, s) : Vc(i) ? ds(e, i, s) : s({}); } }; }
function Vc(e) { return qc.includes(e); }
function jc(e, t) { return $e(te("fields", () => { let r = e._runtimeDataModel.models[t]; return fs(t, r); })); }
d();
u();
c();
p();
m();
function ys(e) { return e.replace(/^./, t => t.toUpperCase()); }
var zn = Symbol();
function Qt(e) { let t = [Gc(e), Qc(e), te(zn, () => e), te("$parent", () => e._appliedParent)], r = e._extensions.getAllClientExtensions(); return r && t.push(Gt(r)), me(e, t); }
function Gc(e) { let t = Object.getPrototypeOf(e._originalClient), r = [...new Set(Object.getOwnPropertyNames(t))]; return { getKeys() { return r; }, getPropertyValue(n) { return e[n]; } }; }
function Qc(e) { let t = Object.keys(e._runtimeDataModel.models), r = t.map(be), n = [...new Set(t.concat(r))]; return $e({ getKeys() { return n; }, getPropertyValue(i) { let o = ys(i); if (e._runtimeDataModel.models[o] !== void 0)
        return Hn(e, o); if (e._runtimeDataModel.models[i] !== void 0)
        return Hn(e, i); }, getPropertyDescriptor(i) { if (!r.includes(i))
        return { enumerable: !1 }; } }); }
function ws(e) { return e[zn] ? e[zn] : e; }
function Es(e) { if (typeof e == "function")
    return e(this); if (e.client?.__AccelerateEngine) {
    let r = e.client.__AccelerateEngine;
    this._originalClient._engine = new r(this._originalClient._accelerateEngineConfig);
} let t = Object.create(this._originalClient, { _extensions: { value: this._extensions.append(e) }, _appliedParent: { value: this, configurable: !0 }, $use: { value: void 0 }, $on: { value: void 0 } }); return Qt(t); }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
function bs({ result: e, modelName: t, select: r, omit: n, extensions: i }) { let o = i.getAllComputedFields(t); if (!o)
    return e; let s = [], a = []; for (let l of Object.values(o)) {
    if (n) {
        if (n[l.name])
            continue;
        let f = l.needs.filter(g => n[g]);
        f.length > 0 && a.push(ft(f));
    }
    else if (r) {
        if (!r[l.name])
            continue;
        let f = l.needs.filter(g => !r[g]);
        f.length > 0 && a.push(ft(f));
    }
    Jc(e, l.needs) && s.push(Wc(l, me(e, s)));
} return s.length > 0 || a.length > 0 ? me(e, [...s, ...a]) : e; }
function Jc(e, t) { return t.every(r => Rn(e, r)); }
function Wc(e, t) { return $e(te(e.name, () => e.compute(t))); }
d();
u();
c();
p();
m();
function Yr({ visitor: e, result: t, args: r, runtimeDataModel: n, modelName: i }) { if (Array.isArray(t)) {
    for (let s = 0; s < t.length; s++)
        t[s] = Yr({ result: t[s], args: r, modelName: i, runtimeDataModel: n, visitor: e });
    return t;
} let o = e(t, i, r) ?? t; return r.include && xs({ includeOrSelect: r.include, result: o, parentModelName: i, runtimeDataModel: n, visitor: e }), r.select && xs({ includeOrSelect: r.select, result: o, parentModelName: i, runtimeDataModel: n, visitor: e }), o; }
function xs({ includeOrSelect: e, result: t, parentModelName: r, runtimeDataModel: n, visitor: i }) { for (let [o, s] of Object.entries(e)) {
    if (!s || t[o] == null || xe(s))
        continue;
    let l = n.models[r].fields.find(g => g.name === o);
    if (!l || l.kind !== "object" || !l.relationName)
        continue;
    let f = typeof s == "object" ? s : {};
    t[o] = Yr({ visitor: i, result: t[o], args: f, modelName: l.type, runtimeDataModel: n });
} }
function Ps({ result: e, modelName: t, args: r, extensions: n, runtimeDataModel: i, globalOmit: o }) { return n.isEmpty() || e == null || typeof e != "object" || !i.models[t] ? e : Yr({ result: e, args: r ?? {}, modelName: t, runtimeDataModel: i, visitor: (a, l, f) => { let g = be(l); return bs({ result: a, modelName: g, select: f.select, omit: f.select ? void 0 : { ...o?.[g], ...f.omit }, extensions: n }); } }); }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var Kc = ["$connect", "$disconnect", "$on", "$transaction", "$use", "$extends"], vs = Kc;
function Ts(e) { if (e instanceof se)
    return Hc(e); if (Gr(e))
    return zc(e); if (Array.isArray(e)) {
    let r = [e[0]];
    for (let n = 1; n < e.length; n++)
        r[n] = Jt(e[n]);
    return r;
} let t = {}; for (let r in e)
    t[r] = Jt(e[r]); return t; }
function Hc(e) { return new se(e.strings, e.values); }
function zc(e) { return new jt(e.sql, e.values); }
function Jt(e) { if (typeof e != "object" || e == null || e instanceof Ce || ct(e))
    return e; if (it(e))
    return new ye(e.toFixed()); if (nt(e))
    return new Date(+e); if (ArrayBuffer.isView(e))
    return e.slice(0); if (Array.isArray(e)) {
    let t = e.length, r;
    for (r = Array(t); t--;)
        r[t] = Jt(e[t]);
    return r;
} if (typeof e == "object") {
    let t = {};
    for (let r in e)
        r === "__proto__" ? Object.defineProperty(t, r, { value: Jt(e[r]), configurable: !0, enumerable: !0, writable: !0 }) : t[r] = Jt(e[r]);
    return t;
} ve(e, "Unknown value"); }
function Cs(e, t, r, n = 0) { return e._createPrismaPromise(i => { let o = t.customDataProxyFetch; return "transaction" in t && i !== void 0 && (t.transaction?.kind === "batch" && t.transaction.lock.then(), t.transaction = i), n === r.length ? e._executeRequest(t) : r[n]({ model: t.model, operation: t.model ? t.action : t.clientMethod, args: Ts(t.args ?? {}), __internalParams: t, query: (s, a = t) => { let l = a.customDataProxyFetch; return a.customDataProxyFetch = Is(o, l), a.args = s, Cs(e, a, r, n + 1); } }); }); }
function Rs(e, t) { let { jsModelName: r, action: n, clientMethod: i } = t, o = r ? n : i; if (e._extensions.isEmpty())
    return e._executeRequest(t); let s = e._extensions.getAllQueryCallbacks(r ?? "$none", o); return Cs(e, t, s); }
function Ss(e) { return t => { let r = { requests: t }, n = t[0].extensions.getAllBatchQueryCallbacks(); return n.length ? ks(r, n, 0, e) : e(r); }; }
function ks(e, t, r, n) { if (r === t.length)
    return n(e); let i = e.customDataProxyFetch, o = e.requests[0].transaction; return t[r]({ args: { queries: e.requests.map(s => ({ model: s.modelName, operation: s.action, args: s.args })), transaction: o ? { isolationLevel: o.kind === "batch" ? o.isolationLevel : void 0 } : void 0 }, __internalParams: e, query(s, a = e) { let l = a.customDataProxyFetch; return a.customDataProxyFetch = Is(i, l), ks(a, t, r + 1, n); } }); }
var As = e => e;
function Is(e = As, t = As) { return r => e(t(r)); }
d();
u();
c();
p();
m();
var Os = z("prisma:client"), Ds = { Vercel: "vercel", "Netlify CI": "netlify" };
function Ms({ postinstall: e, ciName: t, clientVersion: r }) {
    if (Os("checkPlatformCaching:postinstall", e), Os("checkPlatformCaching:ciName", t), e === !0 && t && t in Ds) {
        let n = `Prisma has detected that this project was built on ${t}, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered. To fix this, make sure to run the \`prisma generate\` command during the build process.

Learn how: https://pris.ly/d/${Ds[t]}-build`;
        throw console.error(n), new J(n, r);
    }
}
d();
u();
c();
p();
m();
function _s(e, t) { return e ? e.datasources ? e.datasources : e.datasourceUrl ? { [t[0]]: { url: e.datasourceUrl } } : {} : {}; }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var Yc = () => globalThis.process?.release?.name === "node", Zc = () => !!globalThis.Bun || !!globalThis.process?.versions?.bun, Xc = () => !!globalThis.Deno, ep = () => typeof globalThis.Netlify == "object", tp = () => typeof globalThis.EdgeRuntime == "object", rp = () => globalThis.navigator?.userAgent === "Cloudflare-Workers";
function np() { return [[ep, "netlify"], [tp, "edge-light"], [rp, "workerd"], [Xc, "deno"], [Zc, "bun"], [Yc, "node"]].flatMap(r => r[0]() ? [r[1]] : []).at(0) ?? ""; }
var ip = { node: "Node.js", workerd: "Cloudflare Workers", deno: "Deno and Deno Deploy", netlify: "Netlify Edge Functions", "edge-light": "Edge Runtime (Vercel Edge Functions, Vercel Edge Middleware, Next.js (Pages Router) Edge API Routes, Next.js (App Router) Edge Route Handlers or Next.js Middleware)" };
function Zr() { let e = np(); return { id: e, prettyName: ip[e] || e, isEdge: ["workerd", "deno", "netlify", "edge-light"].includes(e) }; }
d();
u();
c();
p();
m();
var Ns = "6.13.0";
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
function ht({ inlineDatasources: e, overrideDatasources: t, env: r, clientVersion: n }) {
    let i, o = Object.keys(e)[0], s = e[o]?.url, a = t[o]?.url;
    if (o === void 0 ? i = void 0 : a ? i = a : s?.value ? i = s.value : s?.fromEnvVar && (i = r[s.fromEnvVar]), s?.fromEnvVar !== void 0 && i === void 0)
        throw Zr().id === "workerd" ? new J(`error: Environment variable not found: ${s.fromEnvVar}.

In Cloudflare module Workers, environment variables are available only in the Worker's \`env\` parameter of \`fetch\`.
To solve this, provide the connection string directly: https://pris.ly/d/cloudflare-datasource-url`, n) : new J(`error: Environment variable not found: ${s.fromEnvVar}.`, n);
    if (i === void 0)
        throw new J("error: Missing URL environment variable, value, or override.", n);
    return i;
}
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var Xr = class extends Error {
    constructor(t, r) { super(t), this.clientVersion = r.clientVersion, this.cause = r.cause; }
    get [Symbol.toStringTag]() { return this.name; }
};
var ae = class extends Xr {
    constructor(t, r) { super(t, r), this.isRetryable = r.isRetryable ?? !0; }
};
d();
u();
c();
p();
m();
function U(e, t) { return { ...e, isRetryable: t }; }
var Ve = class extends ae {
    constructor(t, r) {
        super(t, U(r, !1));
        this.name = "InvalidDatasourceError";
        this.code = "P6001";
    }
};
F(Ve, "InvalidDatasourceError");
function Fs(e) { let t = { clientVersion: e.clientVersion }, r = Object.keys(e.inlineDatasources)[0], n = ht({ inlineDatasources: e.inlineDatasources, overrideDatasources: e.overrideDatasources, clientVersion: e.clientVersion, env: { ...e.env, ...typeof y < "u" ? y.env : {} } }), i; try {
    i = new URL(n);
}
catch {
    throw new Ve(`Error validating datasource \`${r}\`: the URL must start with the protocol \`prisma://\``, t);
} let { protocol: o, searchParams: s } = i; if (o !== "prisma:" && o !== yr)
    throw new Ve(`Error validating datasource \`${r}\`: the URL must start with the protocol \`prisma://\` or \`prisma+postgres://\``, t); let a = s.get("api_key"); if (a === null || a.length < 1)
    throw new Ve(`Error validating datasource \`${r}\`: the URL must contain a valid API key`, t); let l = An(i) ? "http:" : "https:", f = new URL(i.href.replace(o, l)); return { apiKey: a, url: f }; }
d();
u();
c();
p();
m();
var Ls = Ue(Xi()), en = (_h = class {
        constructor({ apiKey: t, tracingHelper: r, logLevel: n, logQueries: i, engineHash: o }) {
            _en_instances.add(this);
            this.apiKey = t, this.tracingHelper = r, this.logLevel = n, this.logQueries = i, this.engineHash = o;
        }
        build({ traceparent: t, transactionId: r } = {}) { let n = { Accept: "application/json", Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json", "Prisma-Engine-Hash": this.engineHash, "Prisma-Engine-Version": Ls.enginesVersion }; this.tracingHelper.isEnabled() && (n.traceparent = t ?? this.tracingHelper.getTraceParent()), r && (n["X-Transaction-Id"] = r); let i = __classPrivateFieldGet(this, _en_instances, "m", _en_e).call(this); return i.length > 0 && (n["X-Capture-Telemetry"] = i.join(", ")), n; }
    },
    _en_instances = new WeakSet(),
    _en_e = function _en_e() { let t = []; return this.tracingHelper.isEnabled() && t.push("tracing"), this.logLevel && t.push(this.logLevel), this.logQueries && t.push("query"), t; },
    _h);
d();
u();
c();
p();
m();
function sp(e) { return e[0] * 1e3 + e[1] / 1e6; }
function Yn(e) { return new Date(sp(e)); }
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var yt = class extends ae {
    constructor(t) {
        super("This request must be retried", U(t, !0));
        this.name = "ForcedRetryError";
        this.code = "P5001";
    }
};
F(yt, "ForcedRetryError");
d();
u();
c();
p();
m();
var je = class extends ae {
    constructor(t, r) {
        super(t, U(r, !1));
        this.name = "NotImplementedYetError";
        this.code = "P5004";
    }
};
F(je, "NotImplementedYetError");
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var G = class extends ae {
    constructor(t, r) { super(t, r), this.response = r.response; let n = this.response.headers.get("prisma-request-id"); if (n) {
        let i = `(The request id was: ${n})`;
        this.message = this.message + " " + i;
    } }
};
var Ge = class extends G {
    constructor(t) {
        super("Schema needs to be uploaded", U(t, !0));
        this.name = "SchemaMissingError";
        this.code = "P5005";
    }
};
F(Ge, "SchemaMissingError");
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var Zn = "This request could not be understood by the server", Wt = class extends G {
    constructor(t, r, n) {
        this.name = "BadRequestError";
        this.code = "P5000";
        super(r || Zn, U(t, !1)), n && (this.code = n);
    }
};
F(Wt, "BadRequestError");
d();
u();
c();
p();
m();
var Kt = class extends G {
    constructor(t, r) {
        this.name = "HealthcheckTimeoutError";
        this.code = "P5013";
        super("Engine not started: healthcheck timeout", U(t, !0)), this.logs = r;
    }
};
F(Kt, "HealthcheckTimeoutError");
d();
u();
c();
p();
m();
var Ht = class extends G {
    constructor(t, r, n) {
        this.name = "EngineStartupError";
        this.code = "P5014";
        super(r, U(t, !0)), this.logs = n;
    }
};
F(Ht, "EngineStartupError");
d();
u();
c();
p();
m();
var zt = class extends G {
    constructor(t) {
        super("Engine version is not supported", U(t, !1));
        this.name = "EngineVersionNotSupportedError";
        this.code = "P5012";
    }
};
F(zt, "EngineVersionNotSupportedError");
d();
u();
c();
p();
m();
var Xn = "Request timed out", Yt = class extends G {
    constructor(t, r = Xn) {
        super(r, U(t, !1));
        this.name = "GatewayTimeoutError";
        this.code = "P5009";
    }
};
F(Yt, "GatewayTimeoutError");
d();
u();
c();
p();
m();
var ap = "Interactive transaction error", Zt = class extends G {
    constructor(t, r = ap) {
        super(r, U(t, !1));
        this.name = "InteractiveTransactionError";
        this.code = "P5015";
    }
};
F(Zt, "InteractiveTransactionError");
d();
u();
c();
p();
m();
var lp = "Request parameters are invalid", Xt = class extends G {
    constructor(t, r = lp) {
        super(r, U(t, !1));
        this.name = "InvalidRequestError";
        this.code = "P5011";
    }
};
F(Xt, "InvalidRequestError");
d();
u();
c();
p();
m();
var ei = "Requested resource does not exist", er = class extends G {
    constructor(t, r = ei) {
        super(r, U(t, !1));
        this.name = "NotFoundError";
        this.code = "P5003";
    }
};
F(er, "NotFoundError");
d();
u();
c();
p();
m();
var ti = "Unknown server error", wt = class extends G {
    constructor(t, r, n) {
        this.name = "ServerError";
        this.code = "P5006";
        super(r || ti, U(t, !0)), this.logs = n;
    }
};
F(wt, "ServerError");
d();
u();
c();
p();
m();
var ri = "Unauthorized, check your connection string", tr = class extends G {
    constructor(t, r = ri) {
        super(r, U(t, !1));
        this.name = "UnauthorizedError";
        this.code = "P5007";
    }
};
F(tr, "UnauthorizedError");
d();
u();
c();
p();
m();
var ni = "Usage exceeded, retry again later", rr = class extends G {
    constructor(t, r = ni) {
        super(r, U(t, !0));
        this.name = "UsageExceededError";
        this.code = "P5008";
    }
};
F(rr, "UsageExceededError");
async function up(e) { let t; try {
    t = await e.text();
}
catch {
    return { type: "EmptyError" };
} try {
    let r = JSON.parse(t);
    if (typeof r == "string")
        switch (r) {
            case "InternalDataProxyError": return { type: "DataProxyError", body: r };
            default: return { type: "UnknownTextError", body: r };
        }
    if (typeof r == "object" && r !== null) {
        if ("is_panic" in r && "message" in r && "error_code" in r)
            return { type: "QueryEngineError", body: r };
        if ("EngineNotStarted" in r || "InteractiveTransactionMisrouted" in r || "InvalidRequestError" in r) {
            let n = Object.values(r)[0].reason;
            return typeof n == "string" && !["SchemaMissing", "EngineVersionNotSupported"].includes(n) ? { type: "UnknownJsonError", body: r } : { type: "DataProxyError", body: r };
        }
    }
    return { type: "UnknownJsonError", body: r };
}
catch {
    return t === "" ? { type: "EmptyError" } : { type: "UnknownTextError", body: t };
} }
async function nr(e, t) { if (e.ok)
    return; let r = { clientVersion: t, response: e }, n = await up(e); if (n.type === "QueryEngineError")
    throw new ne(n.body.message, { code: n.body.error_code, clientVersion: t }); if (n.type === "DataProxyError") {
    if (n.body === "InternalDataProxyError")
        throw new wt(r, "Internal Data Proxy error");
    if ("EngineNotStarted" in n.body) {
        if (n.body.EngineNotStarted.reason === "SchemaMissing")
            return new Ge(r);
        if (n.body.EngineNotStarted.reason === "EngineVersionNotSupported")
            throw new zt(r);
        if ("EngineStartupError" in n.body.EngineNotStarted.reason) {
            let { msg: i, logs: o } = n.body.EngineNotStarted.reason.EngineStartupError;
            throw new Ht(r, i, o);
        }
        if ("KnownEngineStartupError" in n.body.EngineNotStarted.reason) {
            let { msg: i, error_code: o } = n.body.EngineNotStarted.reason.KnownEngineStartupError;
            throw new J(i, t, o);
        }
        if ("HealthcheckTimeout" in n.body.EngineNotStarted.reason) {
            let { logs: i } = n.body.EngineNotStarted.reason.HealthcheckTimeout;
            throw new Kt(r, i);
        }
    }
    if ("InteractiveTransactionMisrouted" in n.body) {
        let i = { IDParseError: "Could not parse interactive transaction ID", NoQueryEngineFoundError: "Could not find Query Engine for the specified host and transaction ID", TransactionStartError: "Could not start interactive transaction" };
        throw new Zt(r, i[n.body.InteractiveTransactionMisrouted.reason]);
    }
    if ("InvalidRequestError" in n.body)
        throw new Xt(r, n.body.InvalidRequestError.reason);
} if (e.status === 401 || e.status === 403)
    throw new tr(r, Et(ri, n)); if (e.status === 404)
    return new er(r, Et(ei, n)); if (e.status === 429)
    throw new rr(r, Et(ni, n)); if (e.status === 504)
    throw new Yt(r, Et(Xn, n)); if (e.status >= 500)
    throw new wt(r, Et(ti, n)); if (e.status >= 400)
    throw new Wt(r, Et(Zn, n)); }
function Et(e, t) { return t.type === "EmptyError" ? e : `${e}: ${JSON.stringify(t)}`; }
d();
u();
c();
p();
m();
function Us(e) { let t = Math.pow(2, e) * 50, r = Math.ceil(Math.random() * t) - Math.ceil(t / 2), n = t + r; return new Promise(i => setTimeout(() => i(n), n)); }
d();
u();
c();
p();
m();
var Re = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function Bs(e) { let t = new TextEncoder().encode(e), r = "", n = t.byteLength, i = n % 3, o = n - i, s, a, l, f, g; for (let h = 0; h < o; h = h + 3)
    g = t[h] << 16 | t[h + 1] << 8 | t[h + 2], s = (g & 16515072) >> 18, a = (g & 258048) >> 12, l = (g & 4032) >> 6, f = g & 63, r += Re[s] + Re[a] + Re[l] + Re[f]; return i == 1 ? (g = t[o], s = (g & 252) >> 2, a = (g & 3) << 4, r += Re[s] + Re[a] + "==") : i == 2 && (g = t[o] << 8 | t[o + 1], s = (g & 64512) >> 10, a = (g & 1008) >> 4, l = (g & 15) << 2, r += Re[s] + Re[a] + Re[l] + "="), r; }
d();
u();
c();
p();
m();
function qs(e) { if (!!e.generator?.previewFeatures.some(r => r.toLowerCase().includes("metrics")))
    throw new J("The `metrics` preview feature is not yet available with Accelerate.\nPlease remove `metrics` from the `previewFeatures` in your schema.\n\nMore information about Accelerate: https://pris.ly/d/accelerate", e.clientVersion); }
d();
u();
c();
p();
m();
var $s = { "@prisma/debug": "workspace:*", "@prisma/engines-version": "6.13.0-35.361e86d0ea4987e9f53a565309b3eed797a6bcbd", "@prisma/fetch-engine": "workspace:*", "@prisma/get-platform": "workspace:*" };
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var ir = class extends ae {
    constructor(t, r) {
        super(`Cannot fetch data from service:
${t}`, U(r, !0));
        this.name = "RequestError";
        this.code = "P5010";
    }
};
F(ir, "RequestError");
async function Qe(e, t, r = n => n) { let { clientVersion: n, ...i } = t, o = r(fetch); try {
    return await o(e, i);
}
catch (s) {
    let a = s.message ?? "Unknown error";
    throw new ir(a, { clientVersion: n, cause: s });
} }
var pp = /^[1-9][0-9]*\.[0-9]+\.[0-9]+$/, Vs = z("prisma:client:dataproxyEngine");
async function mp(e, t) { let r = $s["@prisma/engines-version"], n = t.clientVersion ?? "unknown"; if (y.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION || globalThis.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION)
    return y.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION || globalThis.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION; if (e.includes("accelerate") && n !== "0.0.0" && n !== "in-memory")
    return n; let [i, o] = n?.split("-") ?? []; if (o === void 0 && pp.test(i))
    return i; if (o !== void 0 || n === "0.0.0" || n === "in-memory") {
    let [s] = r.split("-") ?? [], [a, l, f] = s.split("."), g = dp(`<=${a}.${l}.${f}`), h = await Qe(g, { clientVersion: n });
    if (!h.ok)
        throw new Error(`Failed to fetch stable Prisma version, unpkg.com status ${h.status} ${h.statusText}, response body: ${await h.text() || "<empty body>"}`);
    let T = await h.text();
    Vs("length of body fetched from unpkg.com", T.length);
    let k;
    try {
        k = JSON.parse(T);
    }
    catch (C) {
        throw console.error("JSON.parse error: body fetched from unpkg.com: ", T), C;
    }
    return k.version;
} throw new je("Only `major.minor.patch` versions are supported by Accelerate.", { clientVersion: n }); }
async function js(e, t) { let r = await mp(e, t); return Vs("version", r), r; }
function dp(e) { return encodeURI(`https://unpkg.com/prisma@${e}/package.json`); }
var Gs = 3, or = z("prisma:client:dataproxyEngine"), bt = class {
    constructor(t) {
        this.name = "DataProxyEngine";
        qs(t), this.config = t, this.env = t.env, this.inlineSchema = Bs(t.inlineSchema), this.inlineDatasources = t.inlineDatasources, this.inlineSchemaHash = t.inlineSchemaHash, this.clientVersion = t.clientVersion, this.engineHash = t.engineVersion, this.logEmitter = t.logEmitter, this.tracingHelper = t.tracingHelper;
    }
    apiKey() { return this.headerBuilder.apiKey; }
    version() { return this.engineHash; }
    async start() { this.startPromise !== void 0 && await this.startPromise, this.startPromise = (async () => { let { apiKey: t, url: r } = this.getURLAndAPIKey(); this.host = r.host, this.protocol = r.protocol, this.headerBuilder = new en({ apiKey: t, tracingHelper: this.tracingHelper, logLevel: this.config.logLevel ?? "error", logQueries: this.config.logQueries, engineHash: this.engineHash }), this.remoteClientVersion = await js(this.host, this.config), or("host", this.host), or("protocol", this.protocol); })(), await this.startPromise; }
    async stop() { }
    propagateResponseExtensions(t) { t?.logs?.length && t.logs.forEach(r => { switch (r.level) {
        case "debug":
        case "trace":
            or(r);
            break;
        case "error":
        case "warn":
        case "info": {
            this.logEmitter.emit(r.level, { timestamp: Yn(r.timestamp), message: r.attributes.message ?? "", target: r.target });
            break;
        }
        case "query": {
            this.logEmitter.emit("query", { query: r.attributes.query ?? "", timestamp: Yn(r.timestamp), duration: r.attributes.duration_ms ?? 0, params: r.attributes.params ?? "", target: r.target });
            break;
        }
        default: r.level;
    } }), t?.traces?.length && this.tracingHelper.dispatchEngineSpans(t.traces); }
    onBeforeExit() { throw new Error('"beforeExit" hook is not applicable to the remote query engine'); }
    async url(t) { return await this.start(), `${this.protocol}//${this.host}/${this.remoteClientVersion}/${this.inlineSchemaHash}/${t}`; }
    async uploadSchema() { let t = { name: "schemaUpload", internal: !0 }; return this.tracingHelper.runInChildSpan(t, async () => { let r = await Qe(await this.url("schema"), { method: "PUT", headers: this.headerBuilder.build(), body: this.inlineSchema, clientVersion: this.clientVersion }); r.ok || or("schema response status", r.status); let n = await nr(r, this.clientVersion); if (n)
        throw this.logEmitter.emit("warn", { message: `Error while uploading schema: ${n.message}`, timestamp: new Date, target: "" }), n; this.logEmitter.emit("info", { message: `Schema (re)uploaded (hash: ${this.inlineSchemaHash})`, timestamp: new Date, target: "" }); }); }
    request(t, { traceparent: r, interactiveTransaction: n, customDataProxyFetch: i }) { return this.requestInternal({ body: t, traceparent: r, interactiveTransaction: n, customDataProxyFetch: i }); }
    async requestBatch(t, { traceparent: r, transaction: n, customDataProxyFetch: i }) { let o = n?.kind === "itx" ? n.options : void 0, s = Kr(t, n); return (await this.requestInternal({ body: s, customDataProxyFetch: i, interactiveTransaction: o, traceparent: r })).map(l => (l.extensions && this.propagateResponseExtensions(l.extensions), "errors" in l ? this.convertProtocolErrorsToClientError(l.errors) : l)); }
    requestInternal({ body: t, traceparent: r, customDataProxyFetch: n, interactiveTransaction: i }) { return this.withRetry({ actionGerund: "querying", callback: async ({ logHttpCall: o }) => { let s = i ? `${i.payload.endpoint}/graphql` : await this.url("graphql"); o(s); let a = await Qe(s, { method: "POST", headers: this.headerBuilder.build({ traceparent: r, transactionId: i?.id }), body: JSON.stringify(t), clientVersion: this.clientVersion }, n); a.ok || or("graphql response status", a.status), await this.handleError(await nr(a, this.clientVersion)); let l = await a.json(); if (l.extensions && this.propagateResponseExtensions(l.extensions), "errors" in l)
            throw this.convertProtocolErrorsToClientError(l.errors); return "batchResult" in l ? l.batchResult : l; } }); }
    async transaction(t, r, n) { let i = { start: "starting", commit: "committing", rollback: "rolling back" }; return this.withRetry({ actionGerund: `${i[t]} transaction`, callback: async ({ logHttpCall: o }) => { if (t === "start") {
            let s = JSON.stringify({ max_wait: n.maxWait, timeout: n.timeout, isolation_level: n.isolationLevel }), a = await this.url("transaction/start");
            o(a);
            let l = await Qe(a, { method: "POST", headers: this.headerBuilder.build({ traceparent: r.traceparent }), body: s, clientVersion: this.clientVersion });
            await this.handleError(await nr(l, this.clientVersion));
            let f = await l.json(), { extensions: g } = f;
            g && this.propagateResponseExtensions(g);
            let h = f.id, T = f["data-proxy"].endpoint;
            return { id: h, payload: { endpoint: T } };
        }
        else {
            let s = `${n.payload.endpoint}/${t}`;
            o(s);
            let a = await Qe(s, { method: "POST", headers: this.headerBuilder.build({ traceparent: r.traceparent }), clientVersion: this.clientVersion });
            await this.handleError(await nr(a, this.clientVersion));
            let l = await a.json(), { extensions: f } = l;
            f && this.propagateResponseExtensions(f);
            return;
        } } }); }
    getURLAndAPIKey() { return Fs({ clientVersion: this.clientVersion, env: this.env, inlineDatasources: this.inlineDatasources, overrideDatasources: this.config.overrideDatasources }); }
    metrics() { throw new je("Metrics are not yet supported for Accelerate", { clientVersion: this.clientVersion }); }
    async withRetry(t) { for (let r = 0;; r++) {
        let n = i => { this.logEmitter.emit("info", { message: `Calling ${i} (n=${r})`, timestamp: new Date, target: "" }); };
        try {
            return await t.callback({ logHttpCall: n });
        }
        catch (i) {
            if (!(i instanceof ae) || !i.isRetryable)
                throw i;
            if (r >= Gs)
                throw i instanceof yt ? i.cause : i;
            this.logEmitter.emit("warn", { message: `Attempt ${r + 1}/${Gs} failed for ${t.actionGerund}: ${i.message ?? "(unknown)"}`, timestamp: new Date, target: "" });
            let o = await Us(r);
            this.logEmitter.emit("warn", { message: `Retrying after ${o}ms`, timestamp: new Date, target: "" });
        }
    } }
    async handleError(t) { if (t instanceof Ge)
        throw await this.uploadSchema(), new yt({ clientVersion: this.clientVersion, cause: t }); if (t)
        throw t; }
    convertProtocolErrorsToClientError(t) { return t.length === 1 ? Hr(t[0], this.config.clientVersion, this.config.activeProvider) : new ie(JSON.stringify(t), { clientVersion: this.config.clientVersion }); }
    applyPendingMigrations() { throw new Error("Method not implemented."); }
};
d();
u();
c();
p();
m();
function Qs({ url: e, adapter: t, copyEngine: r, targetBuildType: n }) {
    let i = [], o = [], s = S => { i.push({ _tag: "warning", value: S }); }, a = S => {
        let M = S.join(`
`);
        o.push({ _tag: "error", value: M });
    }, l = !!e?.startsWith("prisma://"), f = wr(e), g = !!t, h = l || f;
    !g && r && h && s(["recommend--no-engine", "In production, we recommend using `prisma generate --no-engine` (See: `prisma generate --help`)"]);
    let T = h || !r;
    g && (T || n === "edge") && (n === "edge" ? a(["Prisma Client was configured to use the `adapter` option but it was imported via its `/edge` endpoint.", "Please either remove the `/edge` endpoint or remove the `adapter` from the Prisma Client constructor."]) : r ? l && a(["Prisma Client was configured to use the `adapter` option but the URL was a `prisma://` URL.", "Please either use the `prisma://` URL or remove the `adapter` from the Prisma Client constructor."]) : a(["Prisma Client was configured to use the `adapter` option but `prisma generate` was run with `--no-engine`.", "Please run `prisma generate` without `--no-engine` to be able to use Prisma Client with the adapter."]));
    let k = { accelerate: T, ppg: f, driverAdapters: g };
    function C(S) { return S.length > 0; }
    return C(o) ? { ok: !1, diagnostics: { warnings: i, errors: o }, isUsing: k } : { ok: !0, diagnostics: { warnings: i }, isUsing: k };
}
function Js({ copyEngine: e = !0 }, t) { let r; try {
    r = ht({ inlineDatasources: t.inlineDatasources, overrideDatasources: t.overrideDatasources, env: { ...t.env, ...y.env }, clientVersion: t.clientVersion });
}
catch { } let { ok: n, isUsing: i, diagnostics: o } = Qs({ url: r, adapter: t.adapter, copyEngine: e, targetBuildType: "edge" }); for (let h of o.warnings)
    kt(...h.value); if (!n) {
    let h = o.errors[0];
    throw new X(h.value, { clientVersion: t.clientVersion });
} let s = Ze(t.generator), a = s === "library", l = s === "binary", f = s === "client", g = (i.accelerate || i.ppg) && !i.driverAdapters; return i.accelerate ? new bt(t) : (i.driverAdapters, i.accelerate, new bt(t)); }
d();
u();
c();
p();
m();
function tn({ generator: e }) { return e?.previewFeatures ?? []; }
d();
u();
c();
p();
m();
var Ws = e => ({ command: e });
d();
u();
c();
p();
m();
d();
u();
c();
p();
m();
var Ks = e => e.strings.reduce((t, r, n) => `${t}@P${n}${r}`);
d();
u();
c();
p();
m();
function xt(e) { try {
    return Hs(e, "fast");
}
catch {
    return Hs(e, "slow");
} }
function Hs(e, t) { return JSON.stringify(e.map(r => Ys(r, t))); }
function Ys(e, t) { if (Array.isArray(e))
    return e.map(r => Ys(r, t)); if (typeof e == "bigint")
    return { prisma__type: "bigint", prisma__value: e.toString() }; if (nt(e))
    return { prisma__type: "date", prisma__value: e.toJSON() }; if (ye.isDecimal(e))
    return { prisma__type: "decimal", prisma__value: e.toJSON() }; if (w.Buffer.isBuffer(e))
    return { prisma__type: "bytes", prisma__value: e.toString("base64") }; if (fp(e))
    return { prisma__type: "bytes", prisma__value: w.Buffer.from(e).toString("base64") }; if (ArrayBuffer.isView(e)) {
    let { buffer: r, byteOffset: n, byteLength: i } = e;
    return { prisma__type: "bytes", prisma__value: w.Buffer.from(r, n, i).toString("base64") };
} return typeof e == "object" && t === "slow" ? Zs(e) : e; }
function fp(e) { return e instanceof ArrayBuffer || e instanceof SharedArrayBuffer ? !0 : typeof e == "object" && e !== null ? e[Symbol.toStringTag] === "ArrayBuffer" || e[Symbol.toStringTag] === "SharedArrayBuffer" : !1; }
function Zs(e) { if (typeof e != "object" || e === null)
    return e; if (typeof e.toJSON == "function")
    return e.toJSON(); if (Array.isArray(e))
    return e.map(zs); let t = {}; for (let r of Object.keys(e))
    t[r] = zs(e[r]); return t; }
function zs(e) { return typeof e == "bigint" ? e.toString() : Zs(e); }
var gp = /^(\s*alter\s)/i, Xs = z("prisma:client");
function ii(e, t, r, n) {
    if (!(e !== "postgresql" && e !== "cockroachdb") && r.length > 0 && gp.exec(t))
        throw new Error(`Running ALTER using ${n} is not supported
Using the example below you can still execute your query with Prisma, but please note that it is vulnerable to SQL injection attacks and requires you to take care of input sanitization.

Example:
  await prisma.$executeRawUnsafe(\`ALTER USER prisma WITH PASSWORD '\${password}'\`)

More Information: https://pris.ly/d/execute-raw
`);
}
var oi = ({ clientMethod: e, activeProvider: t }) => r => { let n = "", i; if (Gr(r))
    n = r.sql, i = { values: xt(r.values), __prismaRawParameters__: !0 };
else if (Array.isArray(r)) {
    let [o, ...s] = r;
    n = o, i = { values: xt(s || []), __prismaRawParameters__: !0 };
}
else
    switch (t) {
        case "sqlite":
        case "mysql": {
            n = r.sql, i = { values: xt(r.values), __prismaRawParameters__: !0 };
            break;
        }
        case "cockroachdb":
        case "postgresql":
        case "postgres": {
            n = r.text, i = { values: xt(r.values), __prismaRawParameters__: !0 };
            break;
        }
        case "sqlserver": {
            n = Ks(r), i = { values: xt(r.values), __prismaRawParameters__: !0 };
            break;
        }
        default: throw new Error(`The ${t} provider does not support ${e}`);
    } return i?.values ? Xs(`prisma.${e}(${n}, ${i.values})`) : Xs(`prisma.${e}(${n})`), { query: n, parameters: i }; }, ea = { requestArgsToMiddlewareArgs(e) { return [e.strings, ...e.values]; }, middlewareArgsToRequestArgs(e) { let [t, ...r] = e; return new se(t, r); } }, ta = { requestArgsToMiddlewareArgs(e) { return [e]; }, middlewareArgsToRequestArgs(e) { return e[0]; } };
d();
u();
c();
p();
m();
function si(e) { return function (r, n) { let i, o = (s = e) => { try {
    return s === void 0 || s?.kind === "itx" ? i ?? (i = ra(r(s))) : ra(r(s));
}
catch (a) {
    return Promise.reject(a);
} }; return { get spec() { return n; }, then(s, a) { return o().then(s, a); }, catch(s) { return o().catch(s); }, finally(s) { return o().finally(s); }, requestTransaction(s) { let a = o(s); return a.requestTransaction ? a.requestTransaction(s) : a; }, [Symbol.toStringTag]: "PrismaPromise" }; }; }
function ra(e) { return typeof e.then == "function" ? e : Promise.resolve(e); }
d();
u();
c();
p();
m();
var hp = vn.split(".")[0], yp = { isEnabled() { return !1; }, getTraceParent() { return "00-10-10-00"; }, dispatchEngineSpans() { }, getActiveContext() { }, runInChildSpan(e, t) { return t(); } }, ai = class {
    isEnabled() { return this.getGlobalTracingHelper().isEnabled(); }
    getTraceParent(t) { return this.getGlobalTracingHelper().getTraceParent(t); }
    dispatchEngineSpans(t) { return this.getGlobalTracingHelper().dispatchEngineSpans(t); }
    getActiveContext() { return this.getGlobalTracingHelper().getActiveContext(); }
    runInChildSpan(t, r) { return this.getGlobalTracingHelper().runInChildSpan(t, r); }
    getGlobalTracingHelper() { let t = globalThis[`V${hp}_PRISMA_INSTRUMENTATION`], r = globalThis.PRISMA_INSTRUMENTATION; return t?.helper ?? r?.helper ?? yp; }
};
function na() { return new ai; }
d();
u();
c();
p();
m();
function ia(e, t = () => { }) { let r, n = new Promise(i => r = i); return { then(i) { return --e === 0 && r(t()), i?.(n); } }; }
d();
u();
c();
p();
m();
function oa(e) { return typeof e == "string" ? e : e.reduce((t, r) => { let n = typeof r == "string" ? r : r.level; return n === "query" ? t : t && (r === "info" || t === "info") ? "info" : n; }, void 0); }
d();
u();
c();
p();
m();
var rn = class {
    constructor() {
        this._middlewares = [];
    }
    use(t) { this._middlewares.push(t); }
    get(t) { return this._middlewares[t]; }
    has(t) { return !!this._middlewares[t]; }
    length() { return this._middlewares.length; }
};
d();
u();
c();
p();
m();
var aa = Ue(ao());
d();
u();
c();
p();
m();
function nn(e) { return typeof e.batchRequestIdx == "number"; }
d();
u();
c();
p();
m();
function sa(e) { if (e.action !== "findUnique" && e.action !== "findUniqueOrThrow")
    return; let t = []; return e.modelName && t.push(e.modelName), e.query.arguments && t.push(li(e.query.arguments)), t.push(li(e.query.selection)), t.join(""); }
function li(e) { return `(${Object.keys(e).sort().map(r => { let n = e[r]; return typeof n == "object" && n !== null ? `(${r} ${li(n)})` : r; }).join(" ")})`; }
d();
u();
c();
p();
m();
var wp = { aggregate: !1, aggregateRaw: !1, createMany: !0, createManyAndReturn: !0, createOne: !0, deleteMany: !0, deleteOne: !0, executeRaw: !0, findFirst: !1, findFirstOrThrow: !1, findMany: !1, findRaw: !1, findUnique: !1, findUniqueOrThrow: !1, groupBy: !1, queryRaw: !1, runCommandRaw: !0, updateMany: !0, updateManyAndReturn: !0, updateOne: !0, upsertOne: !0 };
function ui(e) { return wp[e]; }
d();
u();
c();
p();
m();
var on = class {
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
d();
u();
c();
p();
m();
function Je(e, t) { if (t === null)
    return t; switch (e) {
    case "bigint": return BigInt(t);
    case "bytes": {
        let { buffer: r, byteOffset: n, byteLength: i } = w.Buffer.from(t, "base64");
        return new Uint8Array(r, n, i);
    }
    case "decimal": return new ye(t);
    case "datetime":
    case "date": return new Date(t);
    case "time": return new Date(`1970-01-01T${t}Z`);
    case "bigint-array": return t.map(r => Je("bigint", r));
    case "bytes-array": return t.map(r => Je("bytes", r));
    case "decimal-array": return t.map(r => Je("decimal", r));
    case "datetime-array": return t.map(r => Je("datetime", r));
    case "date-array": return t.map(r => Je("date", r));
    case "time-array": return t.map(r => Je("time", r));
    default: return t;
} }
function sn(e) { let t = [], r = Ep(e); for (let n = 0; n < e.rows.length; n++) {
    let i = e.rows[n], o = { ...r };
    for (let s = 0; s < i.length; s++)
        o[e.columns[s]] = Je(e.types[s], i[s]);
    t.push(o);
} return t; }
function Ep(e) { let t = {}; for (let r = 0; r < e.columns.length; r++)
    t[e.columns[r]] = null; return t; }
var bp = z("prisma:client:request_handler"), an = class {
    constructor(t, r) { this.logEmitter = r, this.client = t, this.dataloader = new on({ batchLoader: Ss(async ({ requests: n, customDataProxyFetch: i }) => { let { transaction: o, otelParentCtx: s } = n[0], a = n.map(h => h.protocolQuery), l = this.client._tracingHelper.getTraceParent(s), f = n.some(h => ui(h.protocolQuery.action)); return (await this.client._engine.requestBatch(a, { traceparent: l, transaction: xp(o), containsWrite: f, customDataProxyFetch: i })).map((h, T) => { if (h instanceof Error)
            return h; try {
            return this.mapQueryEngineResult(n[T], h);
        }
        catch (k) {
            return k;
        } }); }), singleLoader: async (n) => { let i = n.transaction?.kind === "itx" ? la(n.transaction) : void 0, o = await this.client._engine.request(n.protocolQuery, { traceparent: this.client._tracingHelper.getTraceParent(), interactiveTransaction: i, isWrite: ui(n.protocolQuery.action), customDataProxyFetch: n.customDataProxyFetch }); return this.mapQueryEngineResult(n, o); }, batchBy: n => n.transaction?.id ? `transaction-${n.transaction.id}` : sa(n.protocolQuery), batchOrder(n, i) { return n.transaction?.kind === "batch" && i.transaction?.kind === "batch" ? n.transaction.index - i.transaction.index : 0; } }); }
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
    handleRequestError({ error: t, clientMethod: r, callsite: n, transaction: i, args: o, modelName: s, globalOmit: a }) { if (bp(t), Pp(t, i))
        throw t; if (t instanceof ne && vp(t)) {
        let f = ua(t.meta);
        Ur({ args: o, errors: [f], callsite: n, errorFormat: this.client._errorFormat, originalMethod: r, clientVersion: this.client._clientVersion, globalOmit: a });
    } let l = t.message; if (n && (l = Sr({ callsite: n, originalMethod: r, isPanic: t.isPanic, showColors: this.client._errorFormat === "pretty", message: l })), l = this.sanitizeMessage(l), t.code) {
        let f = s ? { modelName: s, ...t.meta } : t.meta;
        throw new ne(l, { code: t.code, clientVersion: this.client._clientVersion, meta: f, batchRequestIdx: t.batchRequestIdx });
    }
    else {
        if (t.isPanic)
            throw new Te(l, this.client._clientVersion);
        if (t instanceof ie)
            throw new ie(l, { clientVersion: this.client._clientVersion, batchRequestIdx: t.batchRequestIdx });
        if (t instanceof J)
            throw new J(l, this.client._clientVersion);
        if (t instanceof Te)
            throw new Te(l, this.client._clientVersion);
    } throw t.clientVersion = this.client._clientVersion, t; }
    sanitizeMessage(t) { return this.client._errorFormat && this.client._errorFormat !== "pretty" ? (0, aa.default)(t) : t; }
    unpack(t, r, n) { if (!t || (t.data && (t = t.data), !t))
        return t; let i = Object.keys(t)[0], o = Object.values(t)[0], s = r.filter(f => f !== "select" && f !== "include"), a = Wn(o, s), l = i === "queryRaw" ? sn(a) : rt(a); return n ? n(l) : l; }
    get [Symbol.toStringTag]() { return "RequestHandler"; }
};
function xp(e) { if (e) {
    if (e.kind === "batch")
        return { kind: "batch", options: { isolationLevel: e.isolationLevel } };
    if (e.kind === "itx")
        return { kind: "itx", options: la(e) };
    ve(e, "Unknown transaction kind");
} }
function la(e) { return { id: e.id, payload: e.payload }; }
function Pp(e, t) { return nn(e) && t?.kind === "batch" && e.batchRequestIdx !== t.index; }
function vp(e) { return e.code === "P2009" || e.code === "P2012"; }
function ua(e) { if (e.kind === "Union")
    return { kind: "Union", errors: e.errors.map(ua) }; if (Array.isArray(e.selectionPath)) {
    let [, ...t] = e.selectionPath;
    return { ...e, selectionPath: t };
} return e; }
d();
u();
c();
p();
m();
var ca = Ns;
d();
u();
c();
p();
m();
var ga = Ue(Nn());
d();
u();
c();
p();
m();
var q = class extends Error {
    constructor(t) {
        super(t + `
Read more at https://pris.ly/d/client-constructor`), this.name = "PrismaClientConstructorValidationError";
    }
    get [Symbol.toStringTag]() { return "PrismaClientConstructorValidationError"; }
};
F(q, "PrismaClientConstructorValidationError");
var pa = ["datasources", "datasourceUrl", "errorFormat", "adapter", "log", "transactionOptions", "omit", "__internal"], ma = ["pretty", "colorless", "minimal"], da = ["info", "query", "warn", "error"], Tp = { datasources: (e, { datasourceNames: t }) => {
        if (e) {
            if (typeof e != "object" || Array.isArray(e))
                throw new q(`Invalid value ${JSON.stringify(e)} for "datasources" provided to PrismaClient constructor`);
            for (let [r, n] of Object.entries(e)) {
                if (!t.includes(r)) {
                    let i = Pt(r, t) || ` Available datasources: ${t.join(", ")}`;
                    throw new q(`Unknown datasource ${r} provided to PrismaClient constructor.${i}`);
                }
                if (typeof n != "object" || Array.isArray(n))
                    throw new q(`Invalid value ${JSON.stringify(e)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
                if (n && typeof n == "object")
                    for (let [i, o] of Object.entries(n)) {
                        if (i !== "url")
                            throw new q(`Invalid value ${JSON.stringify(e)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
                        if (typeof o != "string")
                            throw new q(`Invalid value ${JSON.stringify(o)} for datasource "${r}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
                    }
            }
        }
    }, adapter: (e, t) => { if (!e && Ze(t.generator) === "client")
        throw new q('Using engine type "client" requires a driver adapter to be provided to PrismaClient constructor.'); if (e === null)
        return; if (e === void 0)
        throw new q('"adapter" property must not be undefined, use null to conditionally disable driver adapters.'); if (!tn(t).includes("driverAdapters"))
        throw new q('"adapter" property can only be provided to PrismaClient constructor when "driverAdapters" preview feature is enabled.'); if (Ze(t.generator) === "binary")
        throw new q('Cannot use a driver adapter with the "binary" Query Engine. Please use the "library" Query Engine.'); }, datasourceUrl: e => {
        if (typeof e < "u" && typeof e != "string")
            throw new q(`Invalid value ${JSON.stringify(e)} for "datasourceUrl" provided to PrismaClient constructor.
Expected string or undefined.`);
    }, errorFormat: e => { if (e) {
        if (typeof e != "string")
            throw new q(`Invalid value ${JSON.stringify(e)} for "errorFormat" provided to PrismaClient constructor.`);
        if (!ma.includes(e)) {
            let t = Pt(e, ma);
            throw new q(`Invalid errorFormat ${e} provided to PrismaClient constructor.${t}`);
        }
    } }, log: e => { if (!e)
        return; if (!Array.isArray(e))
        throw new q(`Invalid value ${JSON.stringify(e)} for "log" provided to PrismaClient constructor.`); function t(r) { if (typeof r == "string" && !da.includes(r)) {
        let n = Pt(r, da);
        throw new q(`Invalid log level "${r}" provided to PrismaClient constructor.${n}`);
    } } for (let r of e) {
        t(r);
        let n = { level: t, emit: i => { let o = ["stdout", "event"]; if (!o.includes(i)) {
                let s = Pt(i, o);
                throw new q(`Invalid value ${JSON.stringify(i)} for "emit" in logLevel provided to PrismaClient constructor.${s}`);
            } } };
        if (r && typeof r == "object")
            for (let [i, o] of Object.entries(r))
                if (n[i])
                    n[i](o);
                else
                    throw new q(`Invalid property ${i} for "log" provided to PrismaClient constructor`);
    } }, transactionOptions: e => { if (!e)
        return; let t = e.maxWait; if (t != null && t <= 0)
        throw new q(`Invalid value ${t} for maxWait in "transactionOptions" provided to PrismaClient constructor. maxWait needs to be greater than 0`); let r = e.timeout; if (r != null && r <= 0)
        throw new q(`Invalid value ${r} for timeout in "transactionOptions" provided to PrismaClient constructor. timeout needs to be greater than 0`); }, omit: (e, t) => { if (typeof e != "object")
        throw new q('"omit" option is expected to be an object.'); if (e === null)
        throw new q('"omit" option can not be `null`'); let r = []; for (let [n, i] of Object.entries(e)) {
        let o = Cp(n, t.runtimeDataModel);
        if (!o) {
            r.push({ kind: "UnknownModel", modelKey: n });
            continue;
        }
        for (let [s, a] of Object.entries(i)) {
            let l = o.fields.find(f => f.name === s);
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
        throw new q(Rp(e, r)); }, __internal: e => { if (!e)
        return; let t = ["debug", "engine", "configOverride"]; if (typeof e != "object")
        throw new q(`Invalid value ${JSON.stringify(e)} for "__internal" to PrismaClient constructor`); for (let [r] of Object.entries(e))
        if (!t.includes(r)) {
            let n = Pt(r, t);
            throw new q(`Invalid property ${JSON.stringify(r)} for "__internal" provided to PrismaClient constructor.${n}`);
        } } };
function ha(e, t) { for (let [r, n] of Object.entries(e)) {
    if (!pa.includes(r)) {
        let i = Pt(r, pa);
        throw new q(`Unknown property ${r} provided to PrismaClient constructor.${i}`);
    }
    Tp[r](n, t);
} if (e.datasourceUrl && e.datasources)
    throw new q('Can not use "datasourceUrl" and "datasources" options at the same time. Pick one of them'); }
function Pt(e, t) { if (t.length === 0 || typeof e != "string")
    return ""; let r = Ap(e, t); return r ? ` Did you mean "${r}"?` : ""; }
function Ap(e, t) { if (t.length === 0)
    return null; let r = t.map(i => ({ value: i, distance: (0, ga.default)(e, i) })); r.sort((i, o) => i.distance < o.distance ? -1 : 1); let n = r[0]; return n.distance < 3 ? n.value : null; }
function Cp(e, t) { return fa(t.models, e) ?? fa(t.types, e); }
function fa(e, t) { let r = Object.keys(e).find(n => _e(n) === t); if (r)
    return e[r]; }
function Rp(e, t) {
    let r = pt(e);
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
    let { message: n, args: i } = Lr(r, "colorless");
    return `Error validating "omit" option:

${i}

${n}`;
}
d();
u();
c();
p();
m();
function ya(e) { return e.length === 0 ? Promise.resolve([]) : new Promise((t, r) => { let n = new Array(e.length), i = null, o = !1, s = 0, a = () => { o || (s++, s === e.length && (o = !0, i ? r(i) : t(n))); }, l = f => { o || (o = !0, r(f)); }; for (let f = 0; f < e.length; f++)
    e[f].then(g => { n[f] = g, a(); }, g => { if (!nn(g)) {
        l(g);
        return;
    } g.batchRequestIdx === f ? l(g) : (i || (i = g), a()); }); }); }
var Le = z("prisma:client");
typeof globalThis == "object" && (globalThis.NODE_CLIENT = !0);
var Sp = { requestArgsToMiddlewareArgs: e => e, middlewareArgsToRequestArgs: e => e }, kp = Symbol.for("prisma.client.transaction.id"), Ip = { id: 0, nextId() { return ++this.id; } };
function ba(e) {
    class t {
        constructor(n) {
            this._originalClient = this;
            this._middlewares = new rn;
            this._createPrismaPromise = si();
            this.$metrics = new dt(this);
            this.$extends = Es;
            e = n?.__internal?.configOverride?.(e) ?? e, Ms(e), n && ha(n, e);
            let i = new Qr().on("error", () => { });
            this._extensions = mt.empty(), this._previewFeatures = tn(e), this._clientVersion = e.clientVersion ?? ca, this._activeProvider = e.activeProvider, this._globalOmit = n?.omit, this._tracingHelper = na();
            let o = e.relativeEnvPaths && { rootEnvPath: e.relativeEnvPaths.rootEnvPath && gr.resolve(e.dirname, e.relativeEnvPaths.rootEnvPath), schemaEnvPath: e.relativeEnvPaths.schemaEnvPath && gr.resolve(e.dirname, e.relativeEnvPaths.schemaEnvPath) }, s;
            if (n?.adapter) {
                s = n.adapter;
                let l = e.activeProvider === "postgresql" || e.activeProvider === "cockroachdb" ? "postgres" : e.activeProvider;
                if (s.provider !== l)
                    throw new J(`The Driver Adapter \`${s.adapterName}\`, based on \`${s.provider}\`, is not compatible with the provider \`${l}\` specified in the Prisma schema.`, this._clientVersion);
                if (n.datasources || n.datasourceUrl !== void 0)
                    throw new J("Custom datasource configuration is not compatible with Prisma Driver Adapters. Please define the database connection string directly in the Driver Adapter configuration.", this._clientVersion);
            }
            let a = e.injectableEdgeEnv?.();
            try {
                let l = n ?? {}, f = l.__internal ?? {}, g = f.debug === !0;
                g && z.enable("prisma:client");
                let h = gr.resolve(e.dirname, e.relativePath);
                Ji.existsSync(h) || (h = e.dirname), Le("dirname", e.dirname), Le("relativePath", e.relativePath), Le("cwd", h);
                let T = f.engine || {};
                if (l.errorFormat ? this._errorFormat = l.errorFormat : y.env.NODE_ENV === "production" ? this._errorFormat = "minimal" : y.env.NO_COLOR ? this._errorFormat = "colorless" : this._errorFormat = "colorless", this._runtimeDataModel = e.runtimeDataModel, this._engineConfig = { cwd: h, dirname: e.dirname, enableDebugLogs: g, allowTriggerPanic: T.allowTriggerPanic, prismaPath: T.binaryPath ?? void 0, engineEndpoint: T.endpoint, generator: e.generator, showColors: this._errorFormat === "pretty", logLevel: l.log && oa(l.log), logQueries: l.log && !!(typeof l.log == "string" ? l.log === "query" : l.log.find(k => typeof k == "string" ? k === "query" : k.level === "query")), env: a?.parsed ?? {}, flags: [], engineWasm: e.engineWasm, compilerWasm: e.compilerWasm, clientVersion: e.clientVersion, engineVersion: e.engineVersion, previewFeatures: this._previewFeatures, activeProvider: e.activeProvider, inlineSchema: e.inlineSchema, overrideDatasources: _s(l, e.datasourceNames), inlineDatasources: e.inlineDatasources, inlineSchemaHash: e.inlineSchemaHash, tracingHelper: this._tracingHelper, transactionOptions: { maxWait: l.transactionOptions?.maxWait ?? 2e3, timeout: l.transactionOptions?.timeout ?? 5e3, isolationLevel: l.transactionOptions?.isolationLevel }, logEmitter: i, isBundled: e.isBundled, adapter: s }, this._accelerateEngineConfig = { ...this._engineConfig, accelerateUtils: { resolveDatasourceUrl: ht, getBatchRequestPayload: Kr, prismaGraphQLToJSError: Hr, PrismaClientUnknownRequestError: ie, PrismaClientInitializationError: J, PrismaClientKnownRequestError: ne, debug: z("prisma:client:accelerateEngine"), engineVersion: Ea.version, clientVersion: e.clientVersion } }, Le("clientVersion", e.clientVersion), this._engine = Js(e, this._engineConfig), this._requestHandler = new an(this, i), l.log)
                    for (let k of l.log) {
                        let C = typeof k == "string" ? k : k.emit === "stdout" ? k.level : null;
                        C && this.$on(C, S => { St.log(`${St.tags[C] ?? ""}`, S.message || S.query); });
                    }
            }
            catch (l) {
                throw l.clientVersion = this._clientVersion, l;
            }
            return this._appliedParent = Qt(this);
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
            Qi();
        } }
        $executeRawInternal(n, i, o, s) { let a = this._activeProvider; return this._request({ action: "executeRaw", args: o, transaction: n, clientMethod: i, argsMapper: oi({ clientMethod: i, activeProvider: a }), callsite: Fe(this._errorFormat), dataPath: [], middlewareArgsMapper: s }); }
        $executeRaw(n, ...i) { return this._createPrismaPromise(o => { if (n.raw !== void 0 || n.sql !== void 0) {
            let [s, a] = wa(n, i);
            return ii(this._activeProvider, s.text, s.values, Array.isArray(n) ? "prisma.$executeRaw`<SQL>`" : "prisma.$executeRaw(sql`<SQL>`)"), this.$executeRawInternal(o, "$executeRaw", s, a);
        } throw new X("`$executeRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw\n", { clientVersion: this._clientVersion }); }); }
        $executeRawUnsafe(n, ...i) { return this._createPrismaPromise(o => (ii(this._activeProvider, n, i, "prisma.$executeRawUnsafe(<SQL>, [...values])"), this.$executeRawInternal(o, "$executeRawUnsafe", [n, ...i]))); }
        $runCommandRaw(n) { if (e.activeProvider !== "mongodb")
            throw new X(`The ${e.activeProvider} provider does not support $runCommandRaw. Use the mongodb provider.`, { clientVersion: this._clientVersion }); return this._createPrismaPromise(i => this._request({ args: n, clientMethod: "$runCommandRaw", dataPath: [], action: "runCommandRaw", argsMapper: Ws, callsite: Fe(this._errorFormat), transaction: i })); }
        async $queryRawInternal(n, i, o, s) { let a = this._activeProvider; return this._request({ action: "queryRaw", args: o, transaction: n, clientMethod: i, argsMapper: oi({ clientMethod: i, activeProvider: a }), callsite: Fe(this._errorFormat), dataPath: [], middlewareArgsMapper: s }); }
        $queryRaw(n, ...i) { return this._createPrismaPromise(o => { if (n.raw !== void 0 || n.sql !== void 0)
            return this.$queryRawInternal(o, "$queryRaw", ...wa(n, i)); throw new X("`$queryRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw\n", { clientVersion: this._clientVersion }); }); }
        $queryRawTyped(n) { return this._createPrismaPromise(i => { if (!this._hasPreviewFlag("typedSql"))
            throw new X("`typedSql` preview feature must be enabled in order to access $queryRawTyped API", { clientVersion: this._clientVersion }); return this.$queryRawInternal(i, "$queryRawTyped", n); }); }
        $queryRawUnsafe(n, ...i) { return this._createPrismaPromise(o => this.$queryRawInternal(o, "$queryRawUnsafe", [n, ...i])); }
        _transactionWithArray({ promises: n, options: i }) { let o = Ip.nextId(), s = ia(n.length), a = n.map((l, f) => { if (l?.[Symbol.toStringTag] !== "PrismaPromise")
            throw new Error("All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function."); let g = i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel, h = { kind: "batch", id: o, index: f, isolationLevel: g, lock: s }; return l.requestTransaction?.(h) ?? l; }); return ya(a); }
        async _transactionWithCallback({ callback: n, options: i }) { let o = { traceparent: this._tracingHelper.getTraceParent() }, s = { maxWait: i?.maxWait ?? this._engineConfig.transactionOptions.maxWait, timeout: i?.timeout ?? this._engineConfig.transactionOptions.timeout, isolationLevel: i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel }, a = await this._engine.transaction("start", o, s), l; try {
            let f = { kind: "itx", ...a };
            l = await n(this._createItxClient(f)), await this._engine.transaction("commit", o, a);
        }
        catch (f) {
            throw await this._engine.transaction("rollback", o, a).catch(() => { }), f;
        } return l; }
        _createItxClient(n) { return me(Qt(me(ws(this), [te("_appliedParent", () => this._appliedParent._createItxClient(n)), te("_createPrismaPromise", () => si(n)), te(kp, () => n.id)])), [ft(vs)]); }
        $transaction(n, i) { let o; typeof n == "function" ? this._engineConfig.adapter?.adapterName === "@prisma/adapter-d1" ? o = () => { throw new Error("Cloudflare D1 does not support interactive transactions. We recommend you to refactor your queries with that limitation in mind, and use batch transactions with `prisma.$transactions([])` where applicable."); } : o = () => this._transactionWithCallback({ callback: n, options: i }) : o = () => this._transactionWithArray({ promises: n, options: i }); let s = { name: "transaction", attributes: { method: "$transaction" } }; return this._tracingHelper.runInChildSpan(s, o); }
        _request(n) { n.otelParentCtx = this._tracingHelper.getActiveContext(); let i = n.middlewareArgsMapper ?? Sp, o = { args: i.requestArgsToMiddlewareArgs(n.args), dataPath: n.dataPath, runInTransaction: !!n.transaction, action: n.action, model: n.model }, s = { middleware: { name: "middleware", middleware: !0, attributes: { method: "$use" }, active: !1 }, operation: { name: "operation", attributes: { method: o.action, model: o.model, name: o.model ? `${o.model}.${o.action}` : o.action } } }, a = -1, l = async (f) => { let g = this._middlewares.get(++a); if (g)
            return this._tracingHelper.runInChildSpan(s.middleware, M => g(f, _ => (M?.end(), l(_)))); let { runInTransaction: h, args: T, ...k } = f, C = { ...n, ...k }; T && (C.args = i.middlewareArgsToRequestArgs(T)), n.transaction !== void 0 && h === !1 && delete C.transaction; let S = await Rs(this, C); return C.model ? Ps({ result: S, modelName: C.model, args: C.args, extensions: this._extensions, runtimeDataModel: this._runtimeDataModel, globalOmit: this._globalOmit }) : S; }; return this._tracingHelper.runInChildSpan(s.operation, () => l(o)); }
        async _executeRequest({ args: n, clientMethod: i, dataPath: o, callsite: s, action: a, model: l, argsMapper: f, transaction: g, unpacker: h, otelParentCtx: T, customDataProxyFetch: k }) {
            try {
                n = f ? f(n) : n;
                let C = { name: "serialize" }, S = this._tracingHelper.runInChildSpan(C, () => Vr({ modelName: l, runtimeDataModel: this._runtimeDataModel, action: a, args: n, clientMethod: i, callsite: s, extensions: this._extensions, errorFormat: this._errorFormat, clientVersion: this._clientVersion, previewFeatures: this._previewFeatures, globalOmit: this._globalOmit }));
                return z.enabled("prisma:client") && (Le("Prisma Client call:"), Le(`prisma.${i}(${ls(n)})`), Le("Generated request:"), Le(JSON.stringify(S, null, 2) + `
`)), g?.kind === "batch" && await g.lock, this._requestHandler.request({ protocolQuery: S, modelName: l, action: a, clientMethod: i, dataPath: o, callsite: s, args: n, extensions: this._extensions, transaction: g, unpacker: h, otelParentCtx: T, otelChildCtx: this._tracingHelper.getActiveContext(), globalOmit: this._globalOmit, customDataProxyFetch: k });
            }
            catch (C) {
                throw C.clientVersion = this._clientVersion, C;
            }
        }
        _hasPreviewFlag(n) { return !!this._engineConfig.previewFeatures?.includes(n); }
        $applyPendingMigrations() { return this._engine.applyPendingMigrations(); }
    }
    return t;
}
function wa(e, t) { return Op(e) ? [new se(e, t), ea] : [e, ta]; }
function Op(e) { return Array.isArray(e) && Array.isArray(e.raw); }
d();
u();
c();
p();
m();
var Dp = new Set(["toJSON", "$$typeof", "asymmetricMatch", Symbol.iterator, Symbol.toStringTag, Symbol.isConcatSpreadable, Symbol.toPrimitive]);
function xa(e) { return new Proxy(e, { get(t, r) { if (r in t)
        return t[r]; if (!Dp.has(r))
        throw new TypeError(`Invalid enum value: ${String(r)}`); } }); }
d();
u();
c();
p();
m();
0 && (module.exports = { DMMF, Debug, Decimal, Extensions, MetricsClient, PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError, Public, Sql, createParam, defineDmmfProperty, deserializeJsonResponse, deserializeRawResult, dmmfToRuntimeDataModel, empty, getPrismaClient, getRuntime, join, makeStrictEnum, makeTypedQueryFactory, objectEnumValues, raw, serializeJsonQuery, skip, sqltag, warnEnvConflicts, warnOnce });
//# sourceMappingURL=edge.js.map