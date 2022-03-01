package com.laioffer.job.db;
import redis.clients.jedis.Jedis;

public class RedisConnection {
    private static final String INSTANCE = "52.91.163.131";
    private static final int PORT = 6379;
    private static final String PASSWORD = "19830718";
    private static final String SEARCH_KEY_TEMPLATE = "search:lat=%s&lon=%s&keyword=%s";
    private static final String FAVORITE_KEY_TEMPLATE = "history:userId=%s";

    private Jedis jedis;

    public RedisConnection() {
        jedis = new Jedis(INSTANCE, PORT);
        jedis.auth(PASSWORD);
    }

    public void close() {
        jedis.close();
    }

    public String getSearchResult(double lat, double lon, String keyword) {
        if (jedis == null) {
            return null;
        }
        String key = String.format(SEARCH_KEY_TEMPLATE, lat, lon, keyword);
        return jedis.get(key);
    }

    public void setSearchResult(double lat, double lon, String keyword, String value) {
        if (jedis == null) {
            return;
        }
        String key = String.format(SEARCH_KEY_TEMPLATE, lat, lon, keyword);
        jedis.set(key, value);
        jedis.expire(key, 10);
    }
    public String getFavoriteResult(String userId) {
        if (jedis == null) {
            return null;
        }
        String key = String.format(FAVORITE_KEY_TEMPLATE, userId);
        return jedis.get(key);
    }

    public void setFavoriteResult(String userId, String value) {
        if (jedis == null) {
            return;
        }
        String key = String.format(FAVORITE_KEY_TEMPLATE, userId);
        jedis.set(key, value);
        jedis.expire(key, 10);
    }

    public void deleteFavoriteResult(String userId) {
        if (jedis == null) {
            return;
        }
        String key = String.format(FAVORITE_KEY_TEMPLATE, userId);
        jedis.del(key);
    }


}
