package com.weatherology.resources;

import com.google.gson.Gson;
import com.weatherology.helpers.JsonTransformer;
import com.weatherology.services.users.UserService;

import spark.Request;
import spark.Response;
import spark.Route;

import static spark.Spark.get;
import static spark.Spark.post;
import static spark.Spark.put;

/** Exposes REST endpoints for user services
 * @author Musa V. Ahmed
 */
public class UserResource {
	/** API context */
	private static final String API_CONTEXT = "/api/v1";
	/** UserService instance */
	private final UserService userService;
	
	/** Constructor for UserSerivce receives UserServicer and exposes endpoints
	 * @param userService
	 */
	public UserResource(UserService userService) {
		this.userService = userService;
		setupEndpoints();
	}
	
	/** Exposes REST endpoints, calls necessary service, serializes to Json
	 */
	private void setupEndpoints() {
		post(API_CONTEXT + "/users", "application/json", (request, response) -> {
			userService.createNewUser(request.body());
			response.status(201);
			return response;
		}, new JsonTransformer());
		
		get(API_CONTEXT + "/users/:id", "application/json", (request, response)
				-> userService.find(request.params(":id")), new JsonTransformer());
		
		put(API_CONTEXT + "/users/:id", "application/json", (request, response)
				-> userService.update(request.params(":id"), request.body()), new JsonTransformer());
	}
}
