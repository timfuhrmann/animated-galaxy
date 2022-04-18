const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
    swcMinify: true,
    compiler: {
        styledComponents: true,
    },
    webpack: config => {
        config.module.rules.push({
            test: /\.(glsl|vs|fs|vert|frag)$/,
            use: ["raw-loader", "glslify-loader"],
        });

        return config;
    },
});
