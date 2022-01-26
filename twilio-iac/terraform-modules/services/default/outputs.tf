output "flex_chat_service_sid" {
  description = "Twilio SID of the 'flex chat' service"
  value = twilio_chat_services_v2.flex_chat_service.sid
}
output "flex_proxy_service_sid" {
  description = "Twilio SID of the 'flex proxy' service"
  value = twilio_proxy_services_v1.flex_proxy_service.sid
}