variable "helpline" {
  description = "Full capitalised helpline name"
  type        = string
}

variable "serverless_url" {
  description = "Internal Twilio resource SID provided by another module"
  type        = string
}

variable "custom_task_routing_filter_expression" {
  description = "Setting this will override the default task routing filter expression, which is helpline=='<var.helpline>'"
  type = string
  default = ""
}

