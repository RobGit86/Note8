<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class RegisterSuccessController extends AbstractController
{
    #[Route('/register/success', name: 'app_register_success')]
    public function index(): Response
    {

        

        return $this->renderForm('register/success.html.twig', [
            'controller_name' => 'RegisterSuccessController',
        ]);
    }
}
