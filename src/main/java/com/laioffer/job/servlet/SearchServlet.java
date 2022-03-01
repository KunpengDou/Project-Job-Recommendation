package com.laioffer.job.servlet;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.laioffer.job.db.MySQLConnection;
import com.laioffer.job.db.RedisConnection;
import com.laioffer.job.entity.Item;
import com.laioffer.job.entity.ResultResponse;
import com.laioffer.job.external.GitHubClient;

import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.*;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

@WebServlet(name = "SearchServlet", value = "/search")
public class SearchServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //response.getWriter().write("This is SearchServlet");
        String userId = request.getParameter("user_id");
        double lat = Double.parseDouble(request.getParameter("lat"));
        double lon = Double.parseDouble(request.getParameter("lon"));

        MySQLConnection connection = new MySQLConnection();
        Set<String> favoritedItemIds = connection.getFavoriteItemIds(userId);
        connection.close();

        GitHubClient client = new GitHubClient();
        //String itemsString = client.search(lat, lon, null);
        List<Item> items = client.search(lat, lon, null);

        for (Item item : items) {
            item.setFavorite(favoritedItemIds.contains(item.getId()));
        }

        ObjectMapper mapper = new ObjectMapper();
        //session validation
        HttpSession session = request.getSession(false);
        if (session == null) {
            response.setStatus(403);
            mapper.writeValue(response.getWriter(), new ResultResponse("Session Invalid"));
            return;
        }

        mapper.writeValue(response.getWriter(), items);
        response.setContentType("application/json");
        //response.getWriter().print(itemsString);


        RedisConnection redis = new RedisConnection();
        String cachedResult = redis.getSearchResult(lat, lon, null);

        //List<Item> items = null;
        if (cachedResult != null) {
            items = Arrays.asList(mapper.readValue(cachedResult, Item[].class));
        } else {
            //GitHubClient client = new GitHubClient();
            items = client.search(lat, lon, null);
            redis.setSearchResult(lat, lon, null, mapper.writeValueAsString(items));
        }
        redis.close();

        for (Item item : items) {
            item.setFavorite(favoritedItemIds.contains(item.getId()));
        }
        mapper.writeValue(response.getWriter(), items);

    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws
            ServletException, IOException {

    }
}
